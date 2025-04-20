const en = {
  common: {
    title: "Math Buddy",
    login: "Login",
    register: "Register",
    language: "Language",
    footer: {
      copyright: "© 2023 Math Buddy",
      about: "About",
      contact: "Contact",
      privacy: "Privacy"
    }
  },
  home: {
    hero: {
      title: "Improve your math skills with Math Buddy",
      description:
        "Our diagnostic tool evaluates your mathematical skills and provides personalized recommendations to help you learn and grow. Get started with just a few quick steps!",
      cta: "Start Diagnostic"
    },
    howItWorks: {
      title: "How It Works",
      steps: [
        {
          title: "Enter Your Name",
          description:
            "Start by telling us who you are so we can personalize your experience."
        },
        {
          title: "Take the Assessment",
          description:
            "Answer 10 carefully selected math problems covering various topics."
        },
        {
          title: "Get Your Analysis",
          description:
            "Receive a detailed breakdown of your strengths and areas for improvement."
        },
        {
          title: "Personalized Plan",
          description:
            "Get tailored recommendations to improve your mathematical skills."
        }
      ]
    },
    whyChoose: {
      title: "Why Choose Math Buddy?",
      features: [
        {
          title: "Accurate Assessment",
          description:
            "Precisely identifies your mathematical strengths and weaknesses."
        },
        {
          title: "Personalized Insights",
          description:
            "Customized feedback based on your individual performance."
        },
        {
          title: "Quick and Efficient",
          description: "Complete the assessment in just 10-15 minutes."
        },
        {
          title: "Actionable Recommendations",
          description:
            "Clear next steps to improve your mathematical abilities."
        }
      ]
    },
    finalCta: {
      title: "Ready to discover your math potential?",
      button: "Start Your Assessment Now"
    }
  },
  start: {
    title: "Let's Get Started",
    welcome:
      "Welcome to Math Buddy! Before we begin your math assessment, please tell us your name so we can personalize your experience.",
    nameLabel: "Your Name",
    namePlaceholder: "Enter your full name",
    nameError: "Please enter your name",
    continue: "Continue to Assessment",
    whatToExpect: {
      title: "What to expect:",
      items: [
        "You'll answer 10 math questions covering different topics.",
        "The assessment takes about 10-15 minutes to complete.",
        "After completion, you'll receive a personalized analysis and recommendations."
      ]
    }
  },
  questions: {
    title: "Math Assessment",
    loading: "Loading...",
    loadingDescription: "Please wait while we prepare your assessment.",
    questionCount: "Question {current} of {total}",
    answeringAs: "Answering as:"
  },
  results: {
    title: "Your Assessment Results",
    completedOn: "Completed on {date}",
    metrics: {
      overallScore: "Overall Score",
      performance: "Performance",
      questionsCompleted: "Questions Completed"
    },
    performanceByCategory: "Performance by Category",
    strengthsAndWeaknesses: {
      title: "Your Strengths & Areas for Improvement",
      strengths: {
        title: "Strengths",
        description:
          "You demonstrated a good understanding of {area} concepts and problem-solving techniques.",
        continueTo:
          "Continue to build on this strength by exploring more advanced {area} topics."
      },
      weaknesses: {
        title: "Areas for Improvement",
        description:
          "You may benefit from additional practice with {area} problems and concepts.",
        focusOn:
          "Focus on strengthening your understanding of core {area} principles to improve your overall mathematical abilities."
      }
    },
    recommendations: {
      title: "Personalized Recommendations",
      recommendedResources: "Recommended Resources:"
    },
    reminder:
      "Remember, consistent practice is key to improvement in mathematics. Try to spend 15-20 minutes daily on the recommended resources.",
    buttons: {
      retake: "Retake Assessment",
      home: "Back to Home"
    },
    performance: {
      advanced: "Advanced",
      proficient: "Proficient",
      basic: "Basic",
      developing: "Developing"
    }
  }
}

export default en
