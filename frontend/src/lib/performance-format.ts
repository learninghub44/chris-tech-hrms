import type {
  FeedbackCategory,
  GoalStatus,
  PerformanceReviewStatus
} from "@/types";

export const goalStatusLabels: Record<GoalStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked"
};

export const performanceReviewStatusLabels: Record<PerformanceReviewStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ACKNOWLEDGED: "Acknowledged"
};

export const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  GENERAL: "General",
  PRAISE: "Praise",
  IMPROVEMENT: "Improvement"
};

export function formatRating(value: number): string {
  return `${value}/5`;
}
