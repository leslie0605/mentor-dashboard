// Document Types
export interface Suggestion {
  id: string;
  originalText: string;
  suggestedText: string;
  reasoning: string;
  position: {
    start: number;
    end: number;
  };
  resolved: boolean;
  accepted: boolean;
}

export interface MentorEdit {
  id: string;
  text: string;
  originalText?: string;
  position: {
    start: number;
    end: number;
  };
  mentorName: string;
  mentorId?: string;
  timestamp: Date | string;
  fromSuggestion?: boolean;
  suggestionId?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  studentName: string;
  studentId: string;
  suggestions: Suggestion[];
  mentorEdits: MentorEdit[];
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
  feedbackComments?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email?: string;
  role: "student" | "mentor" | "admin";
  avatarUrl?: string;
}
