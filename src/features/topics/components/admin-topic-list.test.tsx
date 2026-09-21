import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminTopicList } from "@/features/topics/components/admin-topic-list";
import type { Topic } from "@/features/topics/types";

vi.mock("@/features/topics/actions", () => ({
  resetTopicStatusToLearnAction: vi.fn(),
}));

function topic(overrides: Partial<Topic> & Pick<Topic, "id" | "slug" | "title" | "status">): Topic {
  return {
    category: "Applied AI",
    difficulty: "intermediate",
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("AdminTopicList", () => {
  it("offers a To Learn reset for curriculum progress, not inbox", () => {
    render(
      <AdminTopicList
        actionLabel="Edit"
        relations={[]}
        topics={[
          topic({
            id: "rag",
            slug: "rag",
            title: "RAG",
            status: "discussed",
          }),
          topic({
            id: "moe",
            slug: "mixture-of-experts",
            title: "Mixture of Experts",
            status: "inbox",
          }),
          topic({
            id: "prompt-engineering",
            slug: "prompt-engineering",
            title: "Prompt Engineering",
            status: "to_learn",
          }),
        ]}
      />,
    );

    expect(screen.getByTestId("reset-to-learn-rag")).toBeInTheDocument();
    expect(screen.getByTestId("admin-topic-rag")).toHaveAttribute("title", "RAG");
    expect(
      screen.queryByRole("button", { name: "Mark as To Learn" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("reset-to-learn-mixture-of-experts"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("reset-to-learn-prompt-engineering"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("reset-to-learn-rag"));

    expect(
      screen.getByRole("button", { name: "Mark as To Learn" }),
    ).toBeVisible();

    fireEvent.pointerDown(document.body);

    expect(
      screen.queryByRole("button", { name: "Mark as To Learn" }),
    ).not.toBeInTheDocument();
  });
});
