import { heroui } from "@heroui/react"
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}", "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "416px",
      sm: "734px",
      md: "1068px",
      lg: "1441px",
    },
    extend: {
      colors: {
        brand: "#004b86",
      },
    },
  },
  darkMode: ["selector", "body.theme-dark"],
  plugins: [heroui()],
}
