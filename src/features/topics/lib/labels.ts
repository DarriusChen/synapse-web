import type { ResourceType, TopicStatus } from "@/features/topics/types";

export const topicStatusLabels: Record<TopicStatus, string> = {
  to_learn: "To learn",
  learning: "Learning",
  discussed: "Discussed",
  inbox: "Inbox",
};

export const topicStatusSymbols: Record<TopicStatus, string> = {
  to_learn: "○",
  learning: "◐",
  discussed: "●",
  inbox: "□",
};

export const resourceTypeIcons: Record<ResourceType, string> = {
  notes: "📝",
  paper: "📄",
  video: "🎥",
  tutorial: "📖",
  repository: "💻",
  website: "🌐",
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  notes: "Notes",
  paper: "Paper",
  video: "Video",
  tutorial: "Tutorial",
  repository: "Repository",
  website: "Website",
};

