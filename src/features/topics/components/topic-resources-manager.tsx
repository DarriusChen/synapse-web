"use client";

import { ArrowUpRight } from "lucide-react";
import { useActionState, useRef, useState } from "react";

import type { TopicFormState } from "@/features/topics/actions";
import {
  resourceTypeIcons,
  resourceTypeLabels,
} from "@/features/topics/lib/labels";
import type { Resource } from "@/features/topics/types";
import { resourceTypes } from "@/features/topics/types";

type ResourceFormAction = (
  prev: TopicFormState,
  formData: FormData,
) => Promise<TopicFormState>;

type TopicResourcesManagerProps = {
  topicId: string;
  resources: Resource[];
  createAction: ResourceFormAction;
  updateAction: ResourceFormAction;
  deleteAction: (formData: FormData) => Promise<void>;
};

type ResourceItemProps = {
  resource: Resource;
  updateAction: ResourceFormAction;
  deleteAction: (formData: FormData) => Promise<void>;
};

function ResourceItem({
  resource,
  updateAction,
  deleteAction,
}: ResourceItemProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: TopicFormState, formData: FormData) => {
      const nextState = await updateAction(prev, formData);
      if (!nextState) {
        setEditing(false);
      }
      return nextState;
    },
    null,
  );

  if (editing) {
    return (
      <li
        className="topic-resources__item topic-resources__item--editing"
        data-testid={`resource-item-${resource.id}`}
      >
        <form
          className="topic-resources__edit-form"
          action={formAction}
          data-testid={`edit-resource-form-${resource.id}`}
        >
          <input type="hidden" name="resourceId" value={resource.id} />
          <input type="hidden" name="topicId" value={resource.topicId} />

          {state?.error ? (
            <p className="topic-form__error" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="topic-resources__fields">
            <label className="topic-form__field">
              <span>Title</span>
              <input
                name="title"
                required
                defaultValue={resource.title}
                aria-invalid={state?.field === "title"}
              />
            </label>

            <label className="topic-form__field">
              <span>URL</span>
              <input
                name="url"
                type="url"
                required
                placeholder="https://..."
                defaultValue={resource.url}
                aria-invalid={state?.field === "url"}
              />
            </label>

            <label className="topic-form__field">
              <span>Type</span>
              <select
                name="type"
                defaultValue={resource.type}
                aria-invalid={state?.field === "type"}
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {resourceTypeIcons[type]} {resourceTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="topic-resources__edit-actions">
            <button
              className="topic-form__submit"
              type="submit"
              disabled={pending}
            >
              {pending ? "Saving…" : "Save resource"}
            </button>
            <button
              className="topic-resources__button"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className="topic-resources__item"
      data-testid={`resource-item-${resource.id}`}
    >
      <div className="topic-resources__main">
        <span className="topic-resources__badge">
          <span aria-hidden="true">{resourceTypeIcons[resource.type]}</span>
          {resourceTypeLabels[resource.type]}
        </span>
        <div className="topic-resources__info">
          <strong>{resource.title}</strong>
          <a
            className="topic-resources__url"
            href={resource.url}
            target="_blank"
            rel="noreferrer"
          >
            <span>{resource.url}</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="topic-resources__actions">
        <button
          className="topic-resources__button"
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${resource.title}`}
        >
          Edit
        </button>
        <form action={deleteAction}>
          <input type="hidden" name="resourceId" value={resource.id} />
          <button
            className="topic-resources__button topic-resources__button--danger"
            type="submit"
            aria-label={`Delete ${resource.title}`}
          >
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}

export function TopicResourcesManager({
  topicId,
  resources,
  createAction,
  updateAction,
  deleteAction,
}: TopicResourcesManagerProps) {
  const addFormRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: TopicFormState, formData: FormData) => {
      const nextState = await createAction(prev, formData);
      if (!nextState) {
        addFormRef.current?.reset();
      }
      return nextState;
    },
    null,
  );

  return (
    <section
      className="topic-resources"
      aria-labelledby="topic-resources-heading"
      data-testid="topic-resources-manager"
    >
      <div className="topic-resources__header">
        <h2 id="topic-resources-heading">Resources & Study Notes</h2>
        <p>
          Items with type <strong>Notes</strong> appear under{" "}
          <strong>Study notes</strong> on the topic page, while all other types
          appear under <strong>Resources</strong>.
        </p>
      </div>

      {resources.length === 0 ? (
        <p className="topic-resources__empty" data-testid="resources-empty">
          No resources or study notes linked to this topic yet.
        </p>
      ) : (
        <ul className="topic-resources__list" data-testid="resources-list">
          {resources.map((resource) => (
            <ResourceItem
              key={resource.id}
              resource={resource}
              updateAction={updateAction}
              deleteAction={deleteAction}
            />
          ))}
        </ul>
      )}

      <form
        ref={addFormRef}
        className="topic-resources__add-form"
        action={formAction}
        data-testid="add-resource-form"
      >
        <input type="hidden" name="topicId" value={topicId} />
        <h3>Add resource</h3>

        {state?.error ? (
          <p className="topic-form__error" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="topic-resources__fields">
          <label className="topic-form__field">
            <span>Title</span>
            <input
              name="title"
              required
              aria-invalid={state?.field === "title"}
            />
          </label>

          <label className="topic-form__field">
            <span>URL</span>
            <input
              name="url"
              type="url"
              required
              placeholder="https://..."
              aria-invalid={state?.field === "url"}
            />
          </label>

          <label className="topic-form__field">
            <span>Type</span>
            <select
              name="type"
              defaultValue="website"
              aria-invalid={state?.field === "type"}
            >
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {resourceTypeIcons[type]} {resourceTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          className="topic-form__submit"
          type="submit"
          disabled={pending}
        >
          {pending ? "Adding…" : "Add resource"}
        </button>
      </form>
    </section>
  );
}
