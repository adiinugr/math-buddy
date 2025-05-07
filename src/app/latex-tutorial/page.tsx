"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { SquareDot } from "lucide-react"
import "katex/dist/katex.min.css"
import { InlineMath } from "react-katex"

const latexExamples = [
  {
    category: "Basic Operations",
    examples: [
      { latex: "$x + y$", description: "Addition" },
      { latex: "$x - y$", description: "Subtraction" },
      { latex: "$x \\times y$", description: "Multiplication" },
      { latex: "$\\frac{x}{y}$", description: "Division" },
      { latex: "$x^y$", description: "Exponent" },
      { latex: "$\\sqrt{x}$", description: "Square root" },
      { latex: "$\\sqrt[n]{x}$", description: "Nth root" }
    ]
  },
  {
    category: "Fractions and Brackets",
    examples: [
      { latex: "$\\frac{a}{b}$", description: "Simple fraction" },
      { latex: "$\\frac{a}{b + c}$", description: "Fraction with denominator" },
      { latex: "$\\left(\\frac{a}{b}\\right)$", description: "Parentheses" },
      {
        latex: "$\\left[\\frac{a}{b}\\right]$",
        description: "Square brackets"
      },
      {
        latex: "$\\left\\{\\frac{a}{b}\\right\\}$",
        description: "Curly braces"
      }
    ]
  },
  {
    category: "Greek Letters",
    examples: [
      { latex: "$\\alpha$", description: "Alpha" },
      { latex: "$\\beta$", description: "Beta" },
      { latex: "$\\gamma$", description: "Gamma" },
      { latex: "$\\delta$", description: "Delta" },
      { latex: "$\\theta$", description: "Theta" },
      { latex: "$\\pi$", description: "Pi" },
      { latex: "$\\omega$", description: "Omega" }
    ]
  },
  {
    category: "Calculus",
    examples: [
      { latex: "$\\frac{dy}{dx}$", description: "Derivative" },
      { latex: "$\\int f(x) dx$", description: "Integral" },
      { latex: "$\\int_{a}^{b} f(x) dx$", description: "Definite integral" },
      { latex: "$\\lim_{x \\to a} f(x)$", description: "Limit" },
      { latex: "$\\sum_{i=1}^{n} x_i$", description: "Summation" },
      { latex: "$\\prod_{i=1}^{n} x_i$", description: "Product" }
    ]
  },
  {
    category: "Algebra",
    examples: [
      { latex: "$ax^2 + bx + c = 0$", description: "Quadratic equation" },
      {
        latex: "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
        description: "Quadratic formula"
      },
      { latex: "$(a + b)^2 = a^2 + 2ab + b^2$", description: "Square of sum" },
      {
        latex: "$(a - b)^2 = a^2 - 2ab + b^2$",
        description: "Square of difference"
      },
      {
        latex: "$a^2 - b^2 = (a + b)(a - b)$",
        description: "Difference of squares"
      }
    ]
  },
  {
    category: "Geometry",
    examples: [
      { latex: "$A = \\pi r^2$", description: "Area of circle" },
      { latex: "$C = 2\\pi r$", description: "Circumference" },
      { latex: "$V = \\frac{4}{3}\\pi r^3$", description: "Volume of sphere" },
      { latex: "$A = \\frac{1}{2}bh$", description: "Area of triangle" },
      { latex: "$A = lw$", description: "Area of rectangle" }
    ]
  },
  {
    category: "Trigonometry",
    examples: [
      { latex: "$\\sin(x)$", description: "Sine" },
      { latex: "$\\cos(x)$", description: "Cosine" },
      { latex: "$\\tan(x)$", description: "Tangent" },
      {
        latex: "$\\sin^2(x) + \\cos^2(x) = 1$",
        description: "Pythagorean identity"
      },
      {
        latex: "$\\sin(2x) = 2\\sin(x)\\cos(x)$",
        description: "Double angle formula"
      }
    ]
  },
  {
    category: "Matrices",
    examples: [
      {
        latex: "$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$",
        description: "2x2 matrix"
      },
      {
        latex:
          "$\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}$",
        description: "3x3 matrix"
      },
      {
        latex: "$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$",
        description: "Determinant"
      }
    ]
  },
  {
    category: "Inequalities",
    examples: [
      { latex: "$x > y$", description: "Greater than" },
      { latex: "$x < y$", description: "Less than" },
      { latex: "$x \\geq y$", description: "Greater than or equal" },
      { latex: "$x \\leq y$", description: "Less than or equal" },
      { latex: "$x \\neq y$", description: "Not equal" }
    ]
  },
  {
    category: "Sets",
    examples: [
      { latex: "$x \\in A$", description: "Element of" },
      { latex: "$A \\subset B$", description: "Subset" },
      { latex: "$A \\cup B$", description: "Union" },
      { latex: "$A \\cap B$", description: "Intersection" },
      { latex: "$\\emptyset$", description: "Empty set" }
    ]
  }
]

export default function LatexTutorialPage() {
  return (
    <div className="min-h-screen p-6 pb-20 sm:p-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex flex-col gap-[32px] items-center w-full max-w-6xl mx-auto relative">
        <div className="w-full">
          <div className="backdrop-blur-lg bg-white/30 p-8 rounded-xl border border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-purple-500/20">
                <SquareDot className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 font-heading">
                LaTeX Math Equation Tutorial
              </h1>
            </div>
            <p className="text-gray-600 mb-6">
              Learn how to write beautiful math equations using LaTeX. Wrap your
              equations in $...$ to render them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {latexExamples.map((category, index) => (
            <Card
              key={index}
              className="backdrop-blur-lg bg-white/30 border-white/20 shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-xl font-heading text-gray-800">
                  {category.category}
                </CardTitle>
                <CardDescription>
                  Common {category.category.toLowerCase()} expressions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.examples.map((example, exampleIndex) => (
                  <div key={exampleIndex} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-mono bg-white/50 p-2 rounded-md">
                        {example.latex}
                      </div>
                      <div className="text-lg bg-white/50 p-2 rounded-md flex items-center justify-center">
                        <InlineMath
                          math={example.latex.replace(/^\$|\$/g, "")}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {example.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
