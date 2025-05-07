declare module "react-katex" {
  import { ComponentType } from "react"

  interface InlineMathProps {
    math: string
  }

  export const InlineMath: ComponentType<InlineMathProps>
}
