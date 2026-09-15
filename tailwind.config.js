export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        bg: '#000000',
        text: '#ffffff',
        muted: '#9A9A9A',
        soft: '#D8D8D8',
        panel: '#0D0D0D',
        border: 'rgba(255,255,255,0.1)',
      },
      screens: {
        xs: '375px',
        sm: '430px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
