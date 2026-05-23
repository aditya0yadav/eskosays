/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                taobao: {
                    primary: '#FF5000',
                    secondary: '#FF8E00',
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '50%': { transform: 'translate(-50px, 50px) rotate(5deg)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                highlightGrow: {
                    '0%': { transform: 'scaleX(0) skewY(-1deg)' },
                    '100%': { transform: 'scaleX(1) skewY(-1deg)' },
                },
            },
            animation: {
                float: 'float 20s ease-in-out infinite',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'highlight-grow': 'highlightGrow 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards',
            },
        },
    },
    plugins: [
        typography,
    ],
}
