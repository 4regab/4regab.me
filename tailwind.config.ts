import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Enhanced neon color system for 2024-2025
        "neon-blue": {
          50: "#e6f9ff",
          100: "#b3efff",
          200: "#80e5ff",
          300: "#4ddbff",
          400: "#1ad1ff",
          500: "#00d4ff", // Primary neon blue
          600: "#00a8cc",
          700: "#007c99",
          800: "#005066",
          900: "#002433",
        },
        "neon-green": {
          50: "#e6fff5",
          100: "#b3ffe0",
          200: "#80ffcb",
          300: "#4dffb6",
          400: "#1affa1",
          500: "#00ff88", // Primary neon green
          600: "#00cc6d",
          700: "#009952",
          800: "#006637",
          900: "#00331c",
        },
        "neon-purple": {
          50: "#f3f0ff",
          100: "#e1d8ff",
          200: "#cfbfff",
          300: "#bda7ff",
          400: "#ab8fff",
          500: "#8b5cf6", // Primary neon purple
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        "neon-pink": {
          50: "#ffe6f2",
          100: "#ffb3d9",
          200: "#ff80c0",
          300: "#ff4da7",
          400: "#ff1a8e",
          500: "#ff0080", // Primary neon pink
          600: "#cc0066",
          700: "#99004d",
          800: "#660033",
          900: "#33001a",
        },
        "neon-yellow": {
          50: "#fffff0",
          100: "#ffffcc",
          200: "#ffff99",
          300: "#ffff66",
          400: "#ffff33",
          500: "#ffff00", // Primary neon yellow
          600: "#cccc00",
          700: "#999900",
          800: "#666600",
          900: "#333300",
        },
        "neon-orange": {
          50: "#fff5e6",
          100: "#ffe0b3",
          200: "#ffcc80",
          300: "#ffb84d",
          400: "#ffa31a",
          500: "#ff8800", // Primary neon orange
          600: "#cc6d00",
          700: "#995200",
          800: "#663700",
          900: "#331b00",
        },
        // Modern neutral system
        "neutral-950": "#0a0a0a",
        "neutral-925": "#111111",
        "neutral-900": "#171717",
        "neutral-875": "#1f1f1f",
        "neutral-850": "#262626",        // Glass effect colors
        "glass": {
          "white": "rgba(255, 255, 255, 0.1)",
          "black": "rgba(0, 0, 0, 0.1)",
          "blue": "rgba(0, 212, 255, 0.1)",
          "green": "rgba(0, 255, 136, 0.1)",
          "purple": "rgba(139, 92, 246, 0.1)",
        },
        // Surface color system for advanced glass effects
        "surface-primary": "rgba(15, 15, 23, 0.8)",
        "surface-secondary": "rgba(30, 30, 40, 0.7)",
        "surface-tertiary": "rgba(45, 45, 55, 0.6)",
        "surface-glass": "rgba(255, 255, 255, 0.05)",
        "surface-glass-strong": "rgba(255, 255, 255, 0.15)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(2rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-2rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-left": {
          "0%": {
            opacity: "0",
            transform: "translateX(2rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(-2rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "glow": {
          "0%, 100%": {
            boxShadow: "0 0 1rem rgba(0, 212, 255, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 2rem rgba(0, 212, 255, 0.5)",
          },
        },
        "pulse-neon": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-down": "slide-down 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-left": "slide-left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-right": "slide-right 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in": "fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "glow": "glow 2s ease-in-out infinite",
        "pulse-neon": "pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 3s ease-in-out infinite",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(0, 212, 255, 0.3)",
        "glow": "0 0 20px rgba(0, 212, 255, 0.4)",
        "glow-lg": "0 0 30px rgba(0, 212, 255, 0.5)",
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.4)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.4)",
        "glow-pink": "0 0 20px rgba(255, 0, 128, 0.4)",
        "inner-glow": "inset 0 0 20px rgba(0, 212, 255, 0.2)",
        "neo": "8px 8px 0px rgba(0, 212, 255, 0.3)",
        "neo-sm": "4px 4px 0px rgba(0, 212, 255, 0.3)",
        "neo-lg": "12px 12px 0px rgba(0, 212, 255, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid": "url(\"data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.03'%3e%3cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e\")",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E\")",
        "shimmer": "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
      },
      aria: {
        "current": 'current="page"',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
