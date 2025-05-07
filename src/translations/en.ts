const en = {
  common: {
    title: "Math Buddy",
    login: "Login",
    register: "Register",
    logout: "Logout",
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
      cta: "Start Diagnostic",
      login: "Login",
      register: "Register",
      dashboard: "Go to Dashboard"
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
      description:
        "Join thousands of students who have improved their math skills with our personalized assessment and learning tools. Start your journey today!",
      button: "Start Your Assessment Now",
      dashboard: "Go to Dashboard",
      register: "Register Now",
      login: "Login"
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
  },
  quiz: {
    join: {
      title: "Join Quiz",
      description:
        "Enter the quiz code provided by your teacher and your name to get started.",
      code: "Quiz Code",
      name: "Your Name",
      button: "Join Quiz",
      loading: "Joining..."
    },
    submit: {
      button: "Submit Answers",
      loading: "Submitting..."
    },
    submitted: {
      title: "Quiz Submitted!",
      description: "Thank you for participating in the quiz."
    }
  },
  generate: {
    title: "Generate Math Questions",
    settings: "Question Settings",
    settingsDescription:
      "Configure the parameters for generating math questions",
    category: "Math Category",
    selectCategory: "Select a category",
    difficulty: "Difficulty Level",
    selectDifficulty: "Select difficulty",
    questionCount: "Number of Questions",
    selectCount: "Select number of questions",
    questions: "Questions",
    generate: "Generate Questions",
    generating: "Generating Questions...",
    generatedQuestions: "Generated Questions",
    generatedDescription:
      "Here are the questions generated based on your settings",
    error: {
      selectCategory: "Please select a category",
      generateFailed: "Failed to generate questions. Please try again."
    },
    publish: "Publish Quiz",
    publishing: "Publishing...",
    publishFailed: "Failed to publish quiz. Please try again."
  },
  dashboard: {
    title: "My Quizzes",
    createQuiz: "Create New Quiz",
    generateQuestions: "Generate Questions",
    noQuizzes: "No quizzes yet",
    noQuizzesDescription: "Get started by creating a new quiz.",
    quizCode: "Quiz Code:",
    active: "Active",
    inactive: "Inactive",
    viewResults: "View Results",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    deleteConfirmTitle: "Delete Quiz",
    deleteConfirmDescription:
      "Are you sure you want to delete this quiz? This action cannot be undone."
  },
  edit: {
    title: "Edit Quiz",
    quizDetails: "Quiz Details",
    quizDescription: "Update your quiz information and questions",
    quizTitle: "Quiz Title",
    description: "Description",
    questions: "Questions",
    question: "Question",
    questionText: "Question Text",
    options: "Options",
    addQuestion: "Add Question",
    remove: "Remove",
    cancel: "Cancel",
    save: "Save Changes",
    saving: "Saving...",
    error: {
      loadFailed: "Failed to load quiz",
      saveFailed: "Failed to save quiz. Please try again."
    }
  }
}

export default en
