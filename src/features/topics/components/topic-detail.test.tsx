import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopicDetailView } from "@/features/topics/components/topic-detail";
import { getTopicDetail } from "@/features/topics/lib/topic-detail";

describe("TopicDetailView", () => {
  it("renders RAG context, neighbors, and resources", () => {
    const detail = getTopicDetail("rag");

    if (!detail) {
      throw new Error("Expected RAG seed topic");
    }

    render(<TopicDetailView detail={detail} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("RAG");
    expect(
      screen.getByText("Retrieval-Augmented Generation"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("topic-about")).toHaveTextContent(
      "RAG combines retrieval with language model generation",
    );
    expect(screen.getByTestId("topic-prerequisites")).toHaveTextContent(
      "Embedding",
    );
    expect(screen.getByTestId("topic-prerequisites")).toHaveTextContent(
      "Vector Database",
    );
    expect(screen.getByTestId("topic-related")).toHaveTextContent(
      "Context Engineering",
    );
    expect(screen.getByRole("link", { name: /Hugging Face Course/ })).toHaveAttribute(
      "href",
      "https://huggingface.co/learn/nlp-course",
    );
    expect(screen.getByRole("link", { name: /RAG Study Notes/ })).toHaveAttribute(
      "href",
      "https://github.com/huggingface/blog/blob/main/rag.md",
    );
    expect(screen.getByRole("link", { name: "Back to map" })).toHaveAttribute(
      "href",
      "/#learning-map",
    );
  });

  it("hides empty neighbor and resource sections", () => {
    render(
      <TopicDetailView
        detail={{
          topic: {
            id: "solo",
            slug: "solo",
            title: "Solo",
            difficulty: "beginner",
            status: "to_learn",
            createdAt: "2026-09-10T00:00:00.000Z",
            updatedAt: "2026-09-10T00:00:00.000Z",
          },
          prerequisites: [],
          related: [],
          resources: [],
          notes: [],
        }}
      />,
    );

    expect(screen.queryByTestId("topic-prerequisites")).not.toBeInTheDocument();
    expect(screen.queryByTestId("topic-related")).not.toBeInTheDocument();
    expect(screen.queryByTestId("topic-resources")).not.toBeInTheDocument();
    expect(screen.queryByTestId("topic-notes")).not.toBeInTheDocument();
  });
});
