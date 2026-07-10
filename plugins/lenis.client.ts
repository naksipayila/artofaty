import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const desktopQuery = window.matchMedia('(min-width: 761px) and (pointer: fine)')
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let lenis: Lenis | null = null
  let animationFrame = 0
  let lightboxObserver: MutationObserver | null = null

  const shouldUseLenis = () => desktopQuery.matches && !reducedMotionQuery.matches
  const hasOpenLightbox = () => Boolean(document.querySelector('.project-lightbox'))
  const hasScrollDismissLightbox = () =>
    window.innerWidth > 760 && Boolean(document.querySelector('.project-lightbox[data-scroll-dismiss-lightbox]'))

  const updateLightboxState = () => {
    const isLightboxBlockingScroll = hasOpenLightbox() && !hasScrollDismissLightbox()
    document.documentElement.classList.toggle('has-open-lightbox', isLightboxBlockingScroll)

    if (!lenis) return

    if (isLightboxBlockingScroll) {
      lenis.stop()
      return
    }

    lenis.start()
  }

  const animate = (time: number) => {
    lenis?.raf(time)
    animationFrame = window.requestAnimationFrame(animate)
  }

  const destroyLenis = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    lenis?.destroy()
    lenis = null
  }

  const createLenis = () => {
    if (lenis || !shouldUseLenis()) return

    lenis = new Lenis({
      duration: 0.58,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1.08
    })

    animationFrame = window.requestAnimationFrame(animate)
    updateLightboxState()
  }

  const refreshLenis = () => {
    if (!shouldUseLenis()) {
      destroyLenis()
      return
    }

    createLenis()
    window.requestAnimationFrame(() => {
      lenis?.resize()
      updateLightboxState()
    })
  }

  nuxtApp.hook('app:mounted', () => {
    lightboxObserver = new MutationObserver(updateLightboxState)
    lightboxObserver.observe(document.body, { childList: true, subtree: true })

    createLenis()

    desktopQuery.addEventListener('change', refreshLenis)
    reducedMotionQuery.addEventListener('change', refreshLenis)
    window.addEventListener('resize', refreshLenis, { passive: true })
  })

  nuxtApp.hook('page:finish', () => {
    refreshLenis()
  })

  window.addEventListener('beforeunload', () => {
    document.documentElement.classList.remove('has-open-lightbox')
    lightboxObserver?.disconnect()
    destroyLenis()
  })
})
