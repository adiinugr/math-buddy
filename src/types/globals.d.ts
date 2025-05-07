// Extend the Tailwind CSS types with our custom animation
declare module "tailwindcss/types/config" {
  interface AnimationConfig {
    slideInDown: string
  }

  interface KeyframesConfig {
    slideInDown: {
      "0%": { transform: string; opacity: number }
      "100%": { transform: string; opacity: number }
    }
  }
}
