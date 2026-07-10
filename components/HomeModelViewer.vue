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

let frameId = 0
let resizeObserver: ResizeObserver | null = null
let visibilityObserver: IntersectionObserver | null = null
let cleanupScene: (() => void) | null = null
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

const stopViewer = () => {
  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = 0
  }

  resizeObserver?.disconnect()
  resizeObserver = null
  visibilityObserver?.disconnect()
  visibilityObserver = null
  cleanupScene?.()
  cleanupScene = null
}

onMounted(async () => {
  const container = viewerRef.value
  if (!container) return

  let wasStopped = false

  try {
    const THREE = await import('three')
    const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
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
    resize()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const frameTime = performance.now()
      const delta = Math.min((frameTime - previousFrameTime) / 1000, 0.1)
      previousFrameTime = frameTime
      if (!isViewerVisible || document.visibilityState !== 'visible') return

      mixers.forEach((mixer) => mixer.update(delta))

      if (modelRoot) {
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
    <div v-if="loadState === 'loading'" class="home-model-viewer__status" role="status">Loading 3D model</div>
    <div v-else-if="loadState === 'error'" class="home-model-viewer__status" role="status">3D model could not load</div>
  </div>
</template>
