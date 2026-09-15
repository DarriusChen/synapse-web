import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearningMap } from "@/features/learning-map/components/learning-map";

describe("LearningMap", () => {
  it("selects a topic without navigating away from the map", async () => {
    render(<LearningMap />);

    expect(screen.getByTestId("selected-topic")).toHaveTextContent(
      "Choose a topic",
    );

    fireEvent.click(await screen.findByText("RAG"));

    expect(screen.getByTestId("selected-topic")).toHaveTextContent("RAG");
    expect(screen.getByTestId("topic-node-rag")).toHaveClass(
      "topic-node--selected",
    );
  });
});
