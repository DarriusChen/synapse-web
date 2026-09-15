import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LearningMap } from "@/features/learning-map/components/learning-map";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LearningMap", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("selects a topic without navigating away from the map", async () => {
    render(<LearningMap />);

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
    render(<LearningMap />);

    fireEvent.click(await screen.findByText("RAG"), { detail: 2 });

    expect(push).toHaveBeenCalledWith("/topics/rag");
  });
});
