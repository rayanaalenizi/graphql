tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#5D5CDE',
                    600: '#4F46E5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81'
                },
                secondary: {
                    50: '#fef3c7',
                    100: '#fde68a',
                    200: '#fcd34d',
                    300: '#fbbf24',
                    400: '#f59e0b',
                    500: '#d97706',
                    600: '#b45309',
                    700: '#92400e',
                    800: '#78350f',
                    900: '#451a03'
                },
                accent: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b'
                },
                purple: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7c3aed',
                    800: '#6b21a8',
                    900: '#581c87'
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'slide-down': 'slideDown 0.6s ease-out',
                'slide-left': 'slideLeft 0.6s ease-out',
                'slide-right': 'slideRight 0.6s ease-out',
                'bounce-in': 'bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'draw': 'draw 2s ease-in-out forwards',
                'scale-up': 'scaleUp 0.3s ease-out',
                'gradient-shift': 'gradientShift 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px) scale(0.98)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                slideLeft: {
                    '0%': { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' }
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' }
                },
                bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.3) rotate(-10deg)' },
                    '50%': { opacity: '1', transform: 'scale(1.05) rotate(2deg)' },
                    '70%': { transform: 'scale(0.95) rotate(-1deg)' },
                    '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' }
                },
                pulseGlow: {
                    '0%, 100%': { 
                        boxShadow: '0 0 20px rgba(93, 92, 222, 0.4)',
                        transform: 'scale(1)'
                    },
                    '50%': { 
                        boxShadow: '0 0 40px rgba(93, 92, 222, 0.8)',
                        transform: 'scale(1.02)'
                    }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(1deg)' }
                },
                draw: {
                    'to': { 'stroke-dashoffset': '0' }
                },
                scaleUp: {
                    '0%': { transform: 'scale(0.95)' },
                    '100%': { transform: 'scale(1)' }
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'mesh-gradient': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
            },
            backdropBlur: {
                'xs': '2px',
                'xl': '24px',
                '2xl': '40px',
                '3xl': '64px'
            }
        }
    }
}