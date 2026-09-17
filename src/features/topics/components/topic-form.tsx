"use client";

import { useActionState } from "react";

import { topicStatusLabels } from "@/features/topics/lib/labels";
import type { TopicFormState } from "@/features/topics/actions";
import type { Topic } from "@/features/topics/types";
import { topicDifficulties, topicStatuses } from "@/features/topics/types";

type TopicFormProps = {
  action: (
    prev: TopicFormState,
    formData: FormData,
  ) => Promise<TopicFormState>;
  topics: Topic[];
  topic?: Topic;
  selectedPrerequisiteIds?: string[];
  selectedRelatedIds?: string[];
  submitLabel: string;
};

export function TopicForm({
  action,
  topics,
  topic,
  selectedPrerequisiteIds = [],
  selectedRelatedIds = [],
  submitLabel,
}: TopicFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const neighbors = topics
    .filter((item) => item.id !== topic?.id)
    .toSorted((left, right) => left.title.localeCompare(right.title));

  return (
    <form className="topic-form" action={formAction} data-testid="topic-form">
      {topic ? <input type="hidden" name="topicId" value={topic.id} /> : null}

      {state?.error ? (
        <p className="topic-form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <label className="topic-form__field">
        <span>Title</span>
        <input
          name="title"
          required
          defaultValue={topic?.title}
          aria-invalid={state?.field === "title"}
        />
      </label>

      <label className="topic-form__field">
        <span>Slug</span>
        <input
          name="slug"
          defaultValue={topic?.slug}
          placeholder="Generated from title"
          aria-invalid={state?.field === "slug"}
        />
      </label>

      <label className="topic-form__field">
        <span>Short description</span>
        <input
          name="shortDescription"
          defaultValue={topic?.shortDescription}
        />
      </label>

      <label className="topic-form__field">
        <span>Description</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={topic?.description}
        />
      </label>

      <label className="topic-form__field">
        <span>Category</span>
        <input name="category" defaultValue={topic?.category} />
      </label>

      <div className="topic-form__row">
        <label className="topic-form__field">
          <span>Difficulty</span>
          <select
            name="difficulty"
            defaultValue={topic?.difficulty ?? "beginner"}
            aria-invalid={state?.field === "difficulty"}
          >
            {topicDifficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>

        <label className="topic-form__field">
          <span>Status</span>
          <select
            name="status"
            defaultValue={topic?.status ?? "to_learn"}
            aria-invalid={state?.field === "status"}
          >
            {topicStatuses.map((status) => (
              <option key={status} value={status}>
                {topicStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="topic-form__fieldset">
        <legend>Prerequisites</legend>
        <p>Topics that should be learned before this one.</p>
        <div className="topic-form__checks">
          {neighbors.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                name="prerequisiteIds"
                value={item.id}
                defaultChecked={selectedPrerequisiteIds.includes(item.id)}
              />
              {item.title}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="topic-form__fieldset">
        <legend>Related topics</legend>
        <p>Conceptual links with no required order.</p>
        <div className="topic-form__checks">
          {neighbors.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                name="relatedIds"
                value={item.id}
                defaultChecked={selectedRelatedIds.includes(item.id)}
              />
              {item.title}
            </label>
          ))}
        </div>
      </fieldset>

      <button className="topic-form__submit" type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
