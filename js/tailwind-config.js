tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        serif: ['Playfair Display', 'serif'],
                    },
                    colors: {
                        brand: {
                            ivory: '#F4F5F7',
                            graphite: '#2D2D2D',
                            black: '#08090D',
                            surface: '#15171C',
                            text: '#E2E8F0',
                            muted: '#94A3B8',
                            gold: '#B9A7D8',
                            goldLight: '#A996CF',
                            silver: '#C9CED6',
                            terracotta: '#B9A7D8',
                        }
                    },
                    animation: {
                        'fade-up': 'fadeUp 0.8s ease-out forwards',
                        'fade-in': 'fadeIn 1.2s ease-out forwards',
                        'pulse-slow': 'pulse 3s ease-in-out infinite',
                    },
                    keyframes: {
                        fadeUp: {
                            '0%': { opacity: '0', transform: 'translateY(30px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        }
                    }
                }
            }
        }





