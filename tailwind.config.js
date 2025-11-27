/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#002F87', // DepEd Blue
                    700: '#00246D',
                    800: '#001B52',
                    900: '#001238',
                    950: '#000924',
                },
                deped: {
                    blue: '#002F87',
                    red: '#DA251D',
                    yellow: '#FCFF00',
                },
                slate: {
                    850: '#151f32', // Custom dark slate
                }
            }
        },
    },
    plugins: [],
}
