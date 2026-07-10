<script setup lang="ts">
import type { AnimationMixer, BufferGeometry, Group, Object3D, PerspectiveCamera, Scene, Texture, WebGLRenderer } from 'three'

const props = withDefaults(defineProps<{
  label?: string
  modelPath?: string
  texturePath?: string
  posterPath?: string
}>(), {
  label: 'Miss Fortune realtime 3D character model',
  modelPath: 'models/MissFortune_low.fbx',
  texturePath: 'models/tex/',
  posterPath: ''
})

const runtimeConfig = useRuntimeConfig()
const viewerRef = ref<HTMLElement | null>(null)
const loadState = ref<'loading' | 'ready' | 'error'>('loading')
const showWireframe = ref(false)
const isRotationPaused = ref(false)
const prefersReducedMotion = ref(false)

let frameId = 0
let resizeObserver: ResizeObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let reducedMotionQuery: MediaQueryList | null = null
let handleReducedMotionChange: ((event: MediaQueryListEvent) => void) | null = null
let cleanupScene: (() => void) | null = null
let wireframeObjects: Object3D[] = []
let isViewerVisible = true

const resolvePublicAssetUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${runtimeConfig.app.baseURL || '/'}${path.replace(/^\/+/, '')}`
}

const modelUrl = computed(() => resolvePublicAssetUrl(props.modelPath))
const posterUrl = computed(() => props.posterPath ? resolvePublicAssetUrl(props.posterPath) : '')
const viewerStyle = computed(() => posterUrl.value ? { '--model-poster': `url("${posterUrl.value}")` } : undefined)

const textureBaseUrl = computed(() => {
  const url = resolvePublicAssetUrl(props.texturePath)

  return url.endsWith('/') ? url : `${url}/`
})

type FbxProperty = boolean | number | number[] | string | Uint8Array | null
type SourceTopology = {
  polygonVertexIndex: number[]
  vertices: number[]
}

const normalizeFbxName = (name: string) => name.replace(/\u0000\u0001/g, '::').split('::')[0].trim().toLowerCase()

const parseFbxSourceTopologies = (buffer: ArrayBuffer, inflate: (data: Uint8Array) => Uint8Array) => {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  const header = new TextDecoder().decode(bytes.subarray(0, 18))
  const topologies = new Map<string, SourceTopology>()

  if (header !== 'Kaydara FBX Binary') {
    return topologies
  }

  const version = view.getUint32(23, true)
  const usesWideOffsets = version >= 7500
  const geometries = new Map<number, Partial<SourceTopology>>()
  const models = new Map<number, string>()
  const connections: Array<{ from: number; to: number }> = []
  const decoder = new TextDecoder()

  const readUint = (offset: number) => usesWideOffsets ? Number(view.getBigUint64(offset, true)) : view.getUint32(offset, true)
  const readArray = (offset: number, type: string): { nextOffset: number; value: number[] } => {
    const length = view.getUint32(offset, true)
    const encoding = view.getUint32(offset + 4, true)
    const compressedLength = view.getUint32(offset + 8, true)
    let raw = bytes.subarray(offset + 12, offset + 12 + compressedLength)

    if (encoding === 1) {
      raw = inflate(raw)
    }

    const rawView = new DataView(raw.buffer, raw.byteOffset, raw.byteLength)
    const value: number[] = []
    const readers: Record<string, { size: number; read: (index: number) => number }> = {
      b: { size: 1, read: (index) => rawView.getInt8(index) },
      c: { size: 1, read: (index) => rawView.getUint8(index) },
      d: { size: 8, read: (index) => rawView.getFloat64(index, true) },
      f: { size: 4, read: (index) => rawView.getFloat32(index, true) },
      i: { size: 4, read: (index) => rawView.getInt32(index, true) },
      l: { size: 8, read: (index) => Number(rawView.getBigInt64(index, true)) },
      y: { size: 2, read: (index) => rawView.getInt16(index, true) }
    }
    const reader = readers[type]

    if (reader) {
      for (let index = 0; index < length; index += 1) {
        value.push(reader.read(index * reader.size))
      }
    }

    return { nextOffset: offset + 12 + compressedLength, value }
  }

  const readProperty = (offset: number): { nextOffset: number; value: FbxProperty } => {
    const type = String.fromCharCode(view.getUint8(offset))
    const dataOffset = offset + 1

    switch (type) {
      case 'Y':
        return { nextOffset: dataOffset + 2, value: view.getInt16(dataOffset, true) }
      case 'C':
        return { nextOffset: dataOffset + 1, value: Boolean(view.getUint8(dataOffset)) }
      case 'I':
        return { nextOffset: dataOffset + 4, value: view.getInt32(dataOffset, true) }
      case 'F':
        return { nextOffset: dataOffset + 4, value: view.getFloat32(dataOffset, true) }
      case 'D':
        return { nextOffset: dataOffset + 8, value: view.getFloat64(dataOffset, true) }
      case 'L':
        return { nextOffset: dataOffset + 8, value: Number(view.getBigInt64(dataOffset, true)) }
      case 'S': {
        const length = view.getUint32(dataOffset, true)
        return { nextOffset: dataOffset + 4 + length, value: decoder.decode(bytes.subarray(dataOffset + 4, dataOffset + 4 + length)) }
      }
      case 'R': {
        const length = view.getUint32(dataOffset, true)
        return { nextOffset: dataOffset + 4 + length, value: bytes.subarray(dataOffset + 4, dataOffset + 4 + length) }
      }
      case 'd':
      case 'f':
      case 'i':
      case 'l':
      case 'b':
      case 'c':
      case 'y': {
        const array = readArray(dataOffset, type)
        return { nextOffset: array.nextOffset, value: array.value }
      }
      default:
        return { nextOffset: dataOffset, value: null }
    }
  }

  const walkNodes = (offset: number, endOffset: number, activeGeometryId: number | null = null) => {
    let cursor = offset

    while (cursor < endOffset) {
      const nodeEndOffset = readUint(cursor)
      const propertyCount = readUint(cursor + (usesWideOffsets ? 8 : 4))
      const nameLengthOffset = cursor + (usesWideOffsets ? 24 : 12)
      const nameLength = view.getUint8(nameLengthOffset)
      const nameStart = nameLengthOffset + 1

      if (nodeEndOffset === 0 || nameLength === 0) {
        return endOffset
      }

      const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength))
      let propertyOffset = nameStart + nameLength
      const properties: FbxProperty[] = []

      for (let index = 0; index < propertyCount; index += 1) {
        const property = readProperty(propertyOffset)
        properties.push(property.value)
        propertyOffset = property.nextOffset
      }

      let geometryId = activeGeometryId

      if (name === 'Geometry' && typeof properties[0] === 'number') {
        geometryId = properties[0]
        geometries.set(geometryId, {})
      }

      if (name === 'Model' && typeof properties[0] === 'number' && typeof properties[1] === 'string') {
        models.set(properties[0], normalizeFbxName(properties[1]))
      }

      if (name === 'C' && properties[0] === 'OO' && typeof properties[1] === 'number' && typeof properties[2] === 'number') {
        connections.push({ from: properties[1], to: properties[2] })
      }

      if (geometryId !== null) {
        const geometry = geometries.get(geometryId)

        if (geometry && name === 'Vertices' && Array.isArray(properties[0])) {
          geometry.vertices = properties[0]
        }

        if (geometry && name === 'PolygonVertexIndex' && Array.isArray(properties[0])) {
          geometry.polygonVertexIndex = properties[0]
        }
      }

      if (propertyOffset < nodeEndOffset) {
        walkNodes(propertyOffset, nodeEndOffset, geometryId)
      }

      cursor = nodeEndOffset
    }

    return cursor
  }

  walkNodes(27, bytes.length)

  geometries.forEach((geometry, id) => {
    if (!geometry.vertices || !geometry.polygonVertexIndex) return

    const connection = connections.find((item) => item.from === id)
    const modelName = connection ? models.get(connection.to) : null

    if (modelName) {
      topologies.set(modelName, {
        polygonVertexIndex: geometry.polygonVertexIndex,
        vertices: geometry.vertices
      })
    }
  })

  return topologies
}

const stopViewer = () => {
  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = 0
  }

  resizeObserver?.disconnect()
  resizeObserver = null
  visibilityObserver?.disconnect()
  visibilityObserver = null
  if (reducedMotionQuery && handleReducedMotionChange) {
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
  }
  reducedMotionQuery = null
  handleReducedMotionChange = null
  cleanupScene?.()
  cleanupScene = null
  wireframeObjects = []
}

const toggleWireframe = () => {
  showWireframe.value = !showWireframe.value
  wireframeObjects.forEach((wireframe) => {
    wireframe.visible = showWireframe.value
  })
}

const toggleRotation = () => {
  if (prefersReducedMotion.value) return
  isRotationPaused.value = !isRotationPaused.value
}

onMounted(async () => {
  const container = viewerRef.value
  if (!container) return

  let wasStopped = false

  try {
    const THREE = await import('three')
    const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
    const { unzlibSync } = await import('three/examples/jsm/libs/fflate.module.js')
    if (!container.isConnected) return

    const scene: Scene = new THREE.Scene()
    const camera: PerspectiveCamera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    const renderer: WebGLRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    })
    let previousFrameTime = performance.now()
    const mixers: AnimationMixer[] = []
    let modelRoot: Group | null = null
    let textureMaps = new Map<string, Texture>()

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping
    renderer.toneMappingExposure = 1
    renderer.domElement.className = 'home-model-viewer__canvas'
    renderer.domElement.setAttribute('role', 'img')
    renderer.domElement.setAttribute('aria-label', props.label)
    container.appendChild(renderer.domElement)

    camera.position.set(0, 0.72, 4.05)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = false
    controls.minPolarAngle = Math.PI * 0.28
    controls.maxPolarAngle = Math.PI * 0.68
    controls.target.set(0, 0.52, 0)

    const platform = new THREE.Mesh(
      new THREE.CircleGeometry(1.8, 72),
      new THREE.MeshBasicMaterial({
        color: 0x62a8ff,
        transparent: true,
        opacity: 0.085,
        side: THREE.DoubleSide
      })
    )
    platform.rotation.x = -Math.PI / 2
    platform.position.y = -1.24
    scene.add(platform)

    const disposeObject = (object: Object3D) => {
      const disposedTextures = new Set<Texture>()

      object.traverse((entry) => {
        const maybeMesh = entry as Object3D & { geometry?: { dispose: () => void }; material?: any }
        maybeMesh.geometry?.dispose()

        const materials = Array.isArray(maybeMesh.material) ? maybeMesh.material : [maybeMesh.material]
        materials.filter(Boolean).forEach((material) => {
          if (material.map && !disposedTextures.has(material.map)) {
            material.map.dispose?.()
            disposedTextures.add(material.map)
          }
          material.dispose?.()
        })
      })

      textureMaps.forEach((texture) => {
        if (!disposedTextures.has(texture)) {
          texture.dispose()
        }
      })
    }

    cleanupScene = () => {
      wasStopped = true
      controls.dispose()
      renderer.dispose()
      disposeObject(scene)
      renderer.domElement.remove()
    }

    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isViewerVisible = entry?.isIntersecting ?? true
      },
      { threshold: 0.01 }
    )
    visibilityObserver.observe(container)
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = reducedMotionQuery.matches
    if (prefersReducedMotion.value) isRotationPaused.value = true
    handleReducedMotionChange = (event) => {
      prefersReducedMotion.value = event.matches
      if (event.matches) isRotationPaused.value = true
    }
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    resize()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const frameTime = performance.now()
      const delta = Math.min((frameTime - previousFrameTime) / 1000, 0.1)
      previousFrameTime = frameTime
      if (!isViewerVisible || document.visibilityState !== 'visible') return

      mixers.forEach((mixer) => mixer.update(delta))

      if (modelRoot && !isRotationPaused.value && !prefersReducedMotion.value) {
        modelRoot.rotation.y += delta * 0.18
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    const textureLoader = new THREE.TextureLoader()
    const textureFiles: Record<string, string> = {
      body: 'body_Color.webp',
      hair: 'hair_Color.webp',
      cloth: 'cloth_Color.webp',
      hat: 'hat_Color.webp',
      necklace: 'necklace_Color.webp',
      groomeye: 'groomEye_Color.webp'
    }
    const loadTextureMaps = async () => {
      const textureEntries = await Promise.all(
        Object.entries(textureFiles).map(async ([name, file]) => {
          try {
            const texture = await textureLoader.loadAsync(`${textureBaseUrl.value}${file}`)
            texture.colorSpace = THREE.SRGBColorSpace
            texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
            texture.needsUpdate = true
            return [name, texture] as const
          } catch {
            return [name, null] as const
          }
        })
      )

      return new Map(textureEntries.filter((entry): entry is readonly [string, Texture] => Boolean(entry[1])))
    }

    const textureMapsPromise = loadTextureMaps()
    const loader = new FBXLoader()
    const modelResponse = await fetch(modelUrl.value)

    if (!modelResponse.ok) {
      throw new Error(`Failed to load model: ${modelResponse.status}`)
    }

    const modelBuffer = await modelResponse.arrayBuffer()
    const sourceTopologies = parseFbxSourceTopologies(modelBuffer, unzlibSync)
    const modelBasePath = modelUrl.value.slice(0, modelUrl.value.lastIndexOf('/') + 1)
    const loadedModel = loader.parse(modelBuffer, modelBasePath)
    textureMaps = await textureMapsPromise

    if (wasStopped || !container.isConnected) {
      disposeObject(loadedModel)
      return
    }

    const root = new THREE.Group()
    modelRoot = root

    const baseColorFallbacks: Record<string, number> = {
      body: 0xd6a08a,
      hair: 0x9a3f38,
      cloth: 0xffffff,
      hat: 0xffffff,
      necklace: 0xffffff,
      groomeye: 0xffffff
    }

    const createSourceWireframeGeometry = (topology: SourceTopology) => {
      const positions: number[] = []
      const face: number[] = []
      const edges = new Set<string>()

      const pushEdge = (startIndex: number, endIndex: number) => {
        if (startIndex === endIndex) return

        const edgeKey = startIndex < endIndex ? `${startIndex}:${endIndex}` : `${endIndex}:${startIndex}`
        if (edges.has(edgeKey)) return

        const startOffset = startIndex * 3
        const endOffset = endIndex * 3
        if (endOffset + 2 >= topology.vertices.length || startOffset + 2 >= topology.vertices.length) return

        edges.add(edgeKey)
        positions.push(
          topology.vertices[startOffset],
          topology.vertices[startOffset + 1],
          topology.vertices[startOffset + 2],
          topology.vertices[endOffset],
          topology.vertices[endOffset + 1],
          topology.vertices[endOffset + 2]
        )
      }

      topology.polygonVertexIndex.forEach((rawIndex) => {
        const vertexIndex = rawIndex < 0 ? -rawIndex - 1 : rawIndex
        face.push(vertexIndex)

        if (rawIndex < 0) {
          for (let index = 0; index < face.length; index += 1) {
            pushEdge(face[index], face[(index + 1) % face.length])
          }

          face.length = 0
        }
      })

      if (!positions.length) return null

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

      return geometry
    }

    loadedModel.traverse((child: Object3D) => {
      if (!('isMesh' in child)) return

      const mesh = child as Object3D & {
        isMesh: boolean
        geometry?: BufferGeometry & { getAttribute?: (name: string) => unknown }
        material?: any
      }
      if (!mesh.isMesh || !mesh.geometry) return

      const hasVertexColors = Boolean(mesh.geometry?.getAttribute?.('color'))

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const unlitMaterials = materials.filter(Boolean).map((material) => {
        const materialName = String(material.name || '').toLowerCase()
        const textureKey = Object.keys(textureFiles).find((key) => materialName.includes(key)) ?? materialName
        const colorTexture = textureMaps.get(textureKey)
        const sourceMap = colorTexture ?? material.map ?? null

        if (sourceMap) {
          sourceMap.colorSpace = THREE.SRGBColorSpace
          sourceMap.needsUpdate = true
        }

        const fallbackColor = baseColorFallbacks[textureKey] ?? baseColorFallbacks[materialName]
        const unlitMaterial = new THREE.MeshBasicMaterial({
          alphaTest: typeof material.alphaTest === 'number' ? material.alphaTest : 0,
          color: sourceMap || hasVertexColors ? 0xffffff : fallbackColor ?? 0xb9a18d,
          depthWrite: material.depthWrite ?? true,
          map: sourceMap,
          opacity: typeof material.opacity === 'number' ? material.opacity : 1,
          side: THREE.DoubleSide,
          transparent: Boolean(material.transparent) || (typeof material.opacity === 'number' && material.opacity < 1),
          vertexColors: colorTexture ? false : hasVertexColors
        })

        unlitMaterial.name = material.name || textureKey
        unlitMaterial.toneMapped = false
        material.dispose?.()

        return unlitMaterial
      })

      if (unlitMaterials.length) {
        mesh.material = Array.isArray(mesh.material) ? unlitMaterials : unlitMaterials[0]
      }

      const sourceTopology = sourceTopologies.get(normalizeFbxName(mesh.name || ''))
      const sourceWireframeGeometry = sourceTopology ? createSourceWireframeGeometry(sourceTopology) : null

      if (sourceWireframeGeometry) {
        const wireframe = new THREE.LineSegments(sourceWireframeGeometry, new THREE.LineBasicMaterial({
          color: 0xffffff,
          depthWrite: false,
          linewidth: 0.35,
          opacity: 0.14,
          transparent: true
        }))
        wireframe.name = `${mesh.name || 'character'} source quad wireframe`
        wireframe.renderOrder = 2
        wireframe.visible = showWireframe.value
        mesh.add(wireframe)
        wireframeObjects.push(wireframe)
      }
    })

    const box = new THREE.Box3().setFromObject(loadedModel)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const height = size.y || Math.max(size.x, size.z, 1)
    loadedModel.position.set(-center.x, -center.y, -center.z)

    root.scale.setScalar(3.55 / height)
    root.rotation.y = -0.22
    root.add(loadedModel)

    const fitBox = new THREE.Box3().setFromObject(root)
    root.position.y += -1.24 - fitBox.min.y

    if (loadedModel.animations?.length) {
      const mixer = new THREE.AnimationMixer(loadedModel)
      mixer.clipAction(loadedModel.animations[0]).play()
      mixers.push(mixer)
    }

    scene.add(root)
    loadState.value = 'ready'
  } catch (error) {
    if (wasStopped) return

    if (import.meta.dev) {
      console.error('[HomeModelViewer] Failed to load model', error)
    }
    loadState.value = 'error'
  }
})

onBeforeUnmount(stopViewer)
</script>

<template>
  <div ref="viewerRef" class="home-model-viewer" :class="`home-model-viewer--${loadState}`" :style="viewerStyle">
    <button
      v-if="loadState === 'ready'"
      class="home-model-viewer__rotation-toggle"
      type="button"
      :aria-pressed="isRotationPaused"
      :disabled="prefersReducedMotion"
      @click.stop="toggleRotation"
    >
      {{ prefersReducedMotion ? 'Motion reduced' : isRotationPaused ? 'Resume rotation' : 'Pause rotation' }}
    </button>
    <button
      v-if="loadState === 'ready'"
      class="home-model-viewer__wireframe-toggle"
      type="button"
      :aria-pressed="showWireframe"
      @click.stop="toggleWireframe"
    >
      {{ showWireframe ? 'Hide wireframe' : 'Show wireframe' }}
    </button>
    <div v-if="loadState === 'loading'" class="home-model-viewer__status" role="status">Loading 3D model</div>
    <div v-else-if="loadState === 'error'" class="home-model-viewer__status" role="status">3D model could not load</div>
  </div>
</template>
