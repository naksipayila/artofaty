const normalizeBaseURL = (value = '/') => {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const appBaseURL = normalizeBaseURL(process.env.NUXT_APP_BASE_URL)
const withBaseURL = (path: string) => `${appBaseURL}${path.replace(/^\/+/, '')}`

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  nitro: {
    prerender: {
      routes: [
        '/',
        '/works',
        '/about'
      ]
    }
  },
  app: {
    baseURL: appBaseURL,
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      titleTemplate: '%s | ATY',
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'description', content: 'ATY is the portfolio of Ali Taha Yapışkan, a 3D Character Artist based in Eskişehir, Turkey.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'ATY' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://cdna.artstation.com' },
        { rel: 'preconnect', href: 'https://cdnb.artstation.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap' },
        { rel: 'icon', type: 'image/png', href: withBaseURL('/logo.png') }
      ]
    }
  }
})
