import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearningMap } from "@/features/learning-map/components/learning-map";
import { topicRelations, topics } from "@/features/topics/data/topics";
import type { Topic } from "@/features/topics/types";

const push = vi.fn();
const inboxTopic: Topic = {
  id: "mixture-of-experts",
  slug: "mixture-of-experts",
  title: "Mixture of Experts",
  difficulty: "advanced",
  status: "inbox",
  createdAt: "2026-09-20T00:00:00.000Z",
  updatedAt: "2026-09-20T00:00:00.000Z",
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/features/topics/actions", () => ({
  createInboxTopicAction: vi.fn(),
}));

describe("LearningMap", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("selects a topic without navigating away from the map", async () => {
    render(<LearningMap topics={topics} topicRelations={topicRelations} />);

    expect(screen.getByTestId("selected-topic")).toHaveTextContent(
      "Choose a topic",
    );
    expect(screen.queryByTestId("open-topic")).not.toBeInTheDocument();

    fireEvent.click(await screen.findByText("RAG"));

    expect(screen.getByTestId("selected-topic")).toHaveTextContent("RAG");
    expect(screen.getByTestId("topic-node-rag")).toHaveClass(
      "topic-node--selected",
    );
    expect(screen.getByTestId("open-topic")).toHaveAttribute(
      "href",
      "/topics/rag",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("opens the topic page when the node is double-clicked", async () => {
    render(<LearningMap topics={topics} topicRelations={topicRelations} />);

    fireEvent.click(await screen.findByText("RAG"), { detail: 2 });

    expect(push).toHaveBeenCalledWith("/topics/rag");
  });

  it("shows Quick Add only for admins, collapsed until clicked", async () => {
    const { rerender } = render(
      <LearningMap topics={topics} topicRelations={topicRelations} />,
    );

    expect(screen.queryByTestId("quick-add-inbox")).not.toBeInTheDocument();

    rerender(
      <LearningMap
        topics={[...topics, inboxTopic]}
        topicRelations={topicRelations}
        isAdmin
      />,
    );

    const quickAddButton = await screen.findByRole("button", {
      name: /Quick add topic/,
    });
    expect(quickAddButton).toBeInTheDocument();
    expect(screen.getByText("1 in Inbox")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Topic title")).not.toBeInTheDocument();

    fireEvent.click(quickAddButton);

    expect(quickAddButton).toHaveClass("quick-add__toggle--hidden");
    expect(screen.getByPlaceholderText("Topic title")).toBeInTheDocument();
    expect(screen.getByText("Status").parentElement).toHaveTextContent("Inbox");
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Difficulty")).toHaveValue("beginner");
    expect(screen.getByLabelText("Short description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to inbox" })).toBeInTheDocument();
  });
});
