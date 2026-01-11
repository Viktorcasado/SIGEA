/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--color-background) / <alpha-value>)",
                surface: "hsl(var(--color-surface) / <alpha-value>)",
                primary: {
                    DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
                    light: "hsl(var(--color-primary-light) / <alpha-value>)",
                },
                secondary: "hsl(var(--color-secondary) / <alpha-value>)",
                success: "hsl(var(--color-success) / <alpha-value>)",
                muted: "hsl(var(--color-text-muted) / <alpha-value>)",
            },
            borderRadius: {
                'lg': 'var(--radius-lg)',
                'md': 'var(--radius-md)',
                'sm': 'var(--radius-sm)',
                'pill': 'var(--radius-full)',
            }
        },
    },
    plugins: [],
}
