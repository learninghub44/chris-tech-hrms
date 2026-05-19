import type {
  ApplicationStatus,
  Candidate,
  InterviewMode,
  InterviewStatus,
  JobStatus,
  OfferStatus
} from "@/types";

export const jobStatusLabels: Record<JobStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed"
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  HIRED: "Hired",
  REJECTED: "Rejected"
};

export const interviewModeLabels: Record<InterviewMode, string> = {
  PHONE: "Phone",
  VIDEO: "Video",
  IN_PERSON: "In person"
};

export const interviewStatusLabels: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

export const offerStatusLabels: Record<OfferStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined"
};

export function getCandidateName(candidate: Pick<Candidate, "firstName" | "lastName">): string {
  return `${candidate.firstName} ${candidate.lastName}`.trim();
}
