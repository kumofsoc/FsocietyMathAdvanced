export interface ApiEnvelope<T> {
  data: T;
  requestId?: string;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ProfileDto {
  id: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgressDto {
  theoryRead: string[];
  solvedTaskIds: string[];
  savedTheoremIds: string[];
  lastTopicId?: string | null;
  updatedAt: string;
}

export interface ProgressSyncRequest {
  theoryRead: string[];
  solvedTaskIds: string[];
  savedTheoremIds: string[];
  lastTopicId?: string | null;
  clientUpdatedAt: string;
}

export interface BackendHealthDto {
  status: "ok" | "degraded";
  version?: string;
}
