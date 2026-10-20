import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TopicResourcesManager } from "@/features/topics/components/topic-resources-manager";
import type { Resource } from "@/features/topics/types";

const sampleResources: Resource[] = [
  {
    id: "rag-paper",
    topicId: "rag",
    title: "RAG Original Paper",
    url: "https://arxiv.org/abs/2005.11401",
    type: "paper",
  },
  {
    id: "rag-notes",
    topicId: "rag",
    title: "Weekly RAG Study Notes",
    url: "https://example.com/rag-notes",
    type: "notes",
  },
];

describe("TopicResourcesManager", () => {
  it("renders empty state when a topic has no resources", () => {
    render(
      <TopicResourcesManager
        topicId="rag"
        resources={[]}
        createAction={vi.fn().mockResolvedValue(null)}
        updateAction={vi.fn().mockResolvedValue(null)}
        deleteAction={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByTestId("topic-resources-manager")).toHaveTextContent(
      "Resources & Study Notes",
    );
    expect(screen.getByTestId("resources-empty")).toHaveTextContent(
      "No resources or study notes linked to this topic yet.",
    );
  });

  it("renders existing resources and supports adding, editing, and deleting", async () => {
    const createAction = vi.fn().mockResolvedValue(null);
    const updateAction = vi.fn().mockResolvedValue(null);
    const deleteAction = vi.fn().mockResolvedValue(undefined);

    render(
      <TopicResourcesManager
        topicId="rag"
        resources={sampleResources}
        createAction={createAction}
        updateAction={updateAction}
        deleteAction={deleteAction}
      />,
    );

    expect(screen.getByText("RAG Original Paper")).toBeInTheDocument();
    expect(screen.getByText("Weekly RAG Study Notes")).toBeInTheDocument();

    // Add resource
    const addForm = screen.getByTestId("add-resource-form");
    fireEvent.change(within(addForm).getByLabelText("Title"), {
      target: { value: "LangChain RAG Tutorial" },
    });
    fireEvent.change(within(addForm).getByLabelText("URL"), {
      target: { value: "https://python.langchain.com/docs/tutorials/rag/" },
    });
    fireEvent.change(within(addForm).getByLabelText("Type"), {
      target: { value: "tutorial" },
    });
    fireEvent.submit(addForm);

    await waitFor(() => {
      expect(createAction).toHaveBeenCalledTimes(1);
    });
    const createdFormData = createAction.mock.calls[0][1] as FormData;
    expect(createdFormData.get("topicId")).toBe("rag");
    expect(createdFormData.get("title")).toBe("LangChain RAG Tutorial");
    expect(createdFormData.get("url")).toBe(
      "https://python.langchain.com/docs/tutorials/rag/",
    );
    expect(createdFormData.get("type")).toBe("tutorial");

    // Edit resource
    fireEvent.click(
      screen.getByRole("button", { name: "Edit RAG Original Paper" }),
    );
    const editForm = screen.getByTestId("edit-resource-form-rag-paper");
    fireEvent.change(within(editForm).getByLabelText("Title"), {
      target: { value: "Lewis et al. (2020) RAG Paper" },
    });
    fireEvent.submit(editForm);

    await waitFor(() => {
      expect(updateAction).toHaveBeenCalledTimes(1);
    });
    const updatedFormData = updateAction.mock.calls[0][1] as FormData;
    expect(updatedFormData.get("resourceId")).toBe("rag-paper");
    expect(updatedFormData.get("topicId")).toBe("rag");
    expect(updatedFormData.get("title")).toBe("Lewis et al. (2020) RAG Paper");

    await waitFor(() => {
      expect(
        screen.queryByTestId("edit-resource-form-rag-paper"),
      ).not.toBeInTheDocument();
    });

    // Delete resource
    const deleteButton = screen.getByRole("button", {
      name: "Delete Weekly RAG Study Notes",
    });
    fireEvent.submit(deleteButton.closest("form")!);

    await waitFor(() => {
      expect(deleteAction).toHaveBeenCalledTimes(1);
    });
    const deletedFormData = deleteAction.mock.calls[0][0] as FormData;
    expect(deletedFormData.get("resourceId")).toBe("rag-notes");
  });

  it("displays validation error when createAction returns an error", async () => {
    const createAction = vi.fn().mockResolvedValue({
      field: "url",
      error: "Enter a valid http:// or https:// URL.",
    });

    render(
      <TopicResourcesManager
        topicId="rag"
        resources={[]}
        createAction={createAction}
        updateAction={vi.fn().mockResolvedValue(null)}
        deleteAction={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const addForm = screen.getByTestId("add-resource-form");
    fireEvent.change(within(addForm).getByLabelText("Title"), {
      target: { value: "Bad Resource" },
    });
    fireEvent.change(within(addForm).getByLabelText("URL"), {
      target: { value: "https://example.com" },
    });
    fireEvent.submit(addForm);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Enter a valid http:// or https:// URL.",
      );
    });
  });
});
