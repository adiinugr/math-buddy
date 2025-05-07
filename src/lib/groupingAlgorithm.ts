import { Participant } from "@prisma/client"

interface DetailedParticipant extends Participant {
  score: number
  totalQuestions?: number
  categories?: {
    [key: string]: {
      correct: number
      total: number
      subcategories: {
        [key: string]: {
          correct: number
          total: number
        }
      }
    }
  }
}

/**
 * Create heterogeneous groups of students based on their assessment results
 * @param participants List of participants with their scores
 * @param groupSize Target size for each group
 * @returns Array of groups, where each group is an array of participants
 */
export function createHeterogeneousGroups(
  participants: DetailedParticipant[],
  groupSize: number
): DetailedParticipant[][] {
  if (!participants.length) return []
  if (groupSize <= 0) return []

  // Sort participants by score (ascending)
  const sortedParticipants = [...participants].sort((a, b) => a.score - b.score)

  // Calculate the number of groups needed
  const numGroups = Math.ceil(participants.length / groupSize)

  // Initialize empty groups
  const groups: DetailedParticipant[][] = Array.from(
    { length: numGroups },
    () => []
  )

  // Distribute participants to ensure heterogeneous skill levels in each group
  for (let i = 0; i < sortedParticipants.length; i++) {
    // Calculate the group index using a zigzag pattern
    const groupIndex = i % numGroups
    groups[groupIndex].push(sortedParticipants[i])
  }

  return groups
}

/**
 * Create groups based on category performance
 * This creates more balanced groups by considering performance in specific categories
 * @param participants List of participants with their detailed results
 * @param groupSize Target size for each group
 * @param categoryKey The category to prioritize when forming groups
 * @returns Array of groups, where each group is an array of participants
 */
export function createCategoryBasedGroups(
  participants: DetailedParticipant[],
  groupSize: number,
  categoryKey: string = "overall"
): DetailedParticipant[][] {
  if (!participants.length) return []
  if (groupSize <= 0) return []

  // If using overall score or participants don't have category data
  if (categoryKey === "overall" || !participants[0]?.categories) {
    return createHeterogeneousGroups(participants, groupSize)
  }

  // Sort participants by their performance in the specified category
  const sortedParticipants = [...participants].sort((a, b) => {
    const aCategory = a.categories?.[categoryKey]
    const bCategory = b.categories?.[categoryKey]

    if (!aCategory || !bCategory) return 0

    const aPercentage = aCategory.correct / aCategory.total
    const bPercentage = bCategory.correct / bCategory.total

    return aPercentage - bPercentage
  })

  // Calculate the number of groups needed
  const numGroups = Math.ceil(participants.length / groupSize)

  // Initialize empty groups
  const groups: DetailedParticipant[][] = Array.from(
    { length: numGroups },
    () => []
  )

  // Distribute participants to ensure heterogeneous skill levels in each group
  for (let i = 0; i < sortedParticipants.length; i++) {
    // Calculate the group index using a zigzag pattern to ensure distribution
    const groupIndex = i % numGroups
    groups[groupIndex].push(sortedParticipants[i])
  }

  return groups
}
