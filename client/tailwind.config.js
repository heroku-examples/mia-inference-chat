/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        heroku: {
          // Purple palette
          purple: {
            95: '#F6F2FB',
            90: '#ECE1F9',
            80: '#D7BFF2',
            70: '#C29EF1',
            65: '#B78DEF',
            60: '#AD7BEE',
            50: '#9050E9',
            40: '#7526E3',
            30: '#5A1BA9',
            20: '#401075',
            15: '#300B60',
            10: '#240643',
          },
          // Violet palette
          violet: {
            95: '#F9F0FF',
            90: '#F2DEFE',
            80: '#E5B9FE',
            70: '#D892FE',
            65: '#D17DFE',
            60: '#CB65FF',
            50: '#BA01FF',
            40: '#9602C7',
            30: '#730394',
            20: '#481A54',
            15: '#3D0157',
            10: '#2E0039',
          },
          // Cloud Blue palette
          cloud: {
            95: '#EAF5FE',
            90: '#CFE9FE',
            80: '#90D0FE',
            70: '#1AB9FF',
            65: '#08ABED',
            60: '#0D9DDA',
            50: '#107CAD',
            40: '#05628A',
            30: '#084968',
            20: '#023248',
            15: '#0A2636',
            10: '#001A28',
          },
          // Base colors for backward compatibility
          base: '#5A1BA9', // Purple-30 as the primary brand color
          light: '#AD7BEE', // Purple-60 as the light variant
          dark: '#401075', // Purple-20 as the dark variant
          black: '#240643', // Purple-10 as the black variant
          white: '#FFFFFF', // Pure white
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
