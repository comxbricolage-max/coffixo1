import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        charcoal: {
          DEFAULT: '#1a1a1a',
          light: '#252525',
          lighter: '#2d2d2d',
        },
        // Warm restaurant/café color palette
        coffee: {
          50: '#faf7f4',
          100: '#f5ede4',
          200: '#e8d5c4',
          300: '#d4b89a',
          400: '#b8956a',
          500: '#9d7a4f',
          600: '#7d6140',
          700: '#634d35',
          800: '#52402d',
          900: '#463729',
        },
        caramel: {
          50: '#fef8f3',
          100: '#fdeee0',
          200: '#fad9be',
          300: '#f6be91',
          400: '#f19a5c',
          500: '#ed7c3a',
          600: '#de6120',
          700: '#b84b1a',
          800: '#933d1a',
          900: '#773419',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf2e3',
          300: '#f5e6cc',
          400: '#eed4ab',
          500: '#e4bc7f',
          600: '#d4a05a',
          700: '#b8824a',
          800: '#976a3f',
          900: '#7b5836',
        },
        olive: {
          50: '#f6f7f4',
          100: '#e9ede3',
          200: '#d3dac7',
          300: '#b4c0a3',
          400: '#8f9f7a',
          500: '#6b7d5a',
          600: '#556448',
          700: '#45503c',
          800: '#3a4234',
          900: '#32382d',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'warm': '0 4px 20px rgba(157, 122, 79, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config

