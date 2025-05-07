/**
 * Helper functions for handling errors in a user-friendly way
 */

interface ErrorInfo {
  type: "connection" | "server" | "general"
  message: string
  originalError?: unknown
}

/**
 * Parse socket-related errors into a user-friendly format
 */
export function parseSocketError(error: unknown): ErrorInfo {
  // Check if it's a socket.io error
  if (typeof error === "string") {
    if (error.includes("transport close") || error.includes("disconnected")) {
      return {
        type: "connection",
        message:
          "Lost connection to the quiz server. Please check your internet connection.",
        originalError: error
      }
    }

    if (error.includes("timeout")) {
      return {
        type: "connection",
        message: "Connection to the quiz server timed out. Please try again.",
        originalError: error
      }
    }

    if (error.includes("not authorized") || error.includes("unauthorized")) {
      return {
        type: "server",
        message:
          "You are not authorized to access this quiz. Please check your code and try again.",
        originalError: error
      }
    }

    if (error.includes("room") && error.includes("not found")) {
      return {
        type: "server",
        message: "The quiz room was not found. Please check your quiz code.",
        originalError: error
      }
    }
  }

  // Handle network-related errors
  if (error instanceof Error) {
    if (
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch")
    ) {
      return {
        type: "connection",
        message: "Network error. Please check your internet connection.",
        originalError: error
      }
    }

    if (
      error.message.includes("timeout") ||
      error.message.includes("timed out")
    ) {
      return {
        type: "connection",
        message: "Request timed out. Please try again.",
        originalError: error
      }
    }

    // Server errors typically in the 5xx range
    if (
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503")
    ) {
      return {
        type: "server",
        message: "Server error. Our servers are currently experiencing issues.",
        originalError: error
      }
    }

    // Client errors typically in the 4xx range
    if (error.message.includes("404")) {
      return {
        type: "server",
        message: "The requested resource was not found.",
        originalError: error
      }
    }

    if (error.message.includes("403")) {
      return {
        type: "server",
        message: "You don't have permission to access this resource.",
        originalError: error
      }
    }

    if (error.message.includes("401")) {
      return {
        type: "server",
        message: "Authentication required. Please log in again.",
        originalError: error
      }
    }
  }

  // Default error response
  return {
    type: "general",
    message:
      typeof error === "string"
        ? error
        : error instanceof Error
        ? error.message
        : "An unexpected error occurred.",
    originalError: error
  }
}

/**
 * Get reconnection advice based on error type
 */
export function getReconnectionAdvice(errorInfo: ErrorInfo): string {
  switch (errorInfo.type) {
    case "connection":
      return "Try checking your Wi-Fi connection, refreshing the page, or rejoining the quiz."
    case "server":
      return "Please wait a moment and try again. If the problem persists, contact your teacher."
    default:
      return "Please try refreshing the page or rejoining the quiz."
  }
}
