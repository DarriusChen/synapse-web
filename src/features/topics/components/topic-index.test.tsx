import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopicIndex } from "@/features/topics/components/topic-index";
import type { Topic } from "@/features/topics/types";

const topics: Topic[] = [
  {
    id: "rag",
    slug: "rag",
    title: "RAG",
    category: "Applied AI",
    difficulty: "intermediate",
    status: "learning",
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
  },
];

describe("TopicIndex", () => {
  it("links each topic to its read-only detail page", () => {
    render(<TopicIndex topics={topics} />);

    expect(screen.getByTestId("topic-index-rag")).toHaveAttribute(
      "href",
      "/topics/rag?from=topics",
    );
    expect(screen.getByTestId("topic-index-rag")).toHaveAttribute("title", "RAG");
    expect(screen.queryByText("New topic")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no visible topics", () => {
    render(<TopicIndex topics={[]} />);

    expect(screen.getByText("No topics to browse yet.")).toBeInTheDocument();
  });
});
