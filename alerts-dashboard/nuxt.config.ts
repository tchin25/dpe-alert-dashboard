// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "nuxt-primevue"],
  build: {
    transpile: [/echarts/],
  },
  primevue: {
    components: {
      include: ["Calendar", "DataTable", "Column"],
    },
  },
});
