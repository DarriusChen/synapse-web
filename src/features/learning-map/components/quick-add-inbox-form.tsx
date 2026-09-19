"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Inbox, Plus, X } from "lucide-react";

import { createInboxTopicAction } from "@/features/topics/actions";
import { topicDifficulties } from "@/features/topics/types";

type QuickAddInboxFormProps = {
  inboxCount: number;
};

export function QuickAddInboxForm({
  inboxCount,
}: QuickAddInboxFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createInboxTopicAction,
    null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="quick-add" data-testid="quick-add-inbox" ref={rootRef}>
      <button
        className={`quick-add__toggle${
          open ? " quick-add__toggle--hidden" : ""
        }`}
        type="button"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={() => setOpen(true)}
      >
        <span className="quick-add__toggle-icon" aria-hidden="true">
          <Plus size={16} strokeWidth={2.4} />
        </span>
        <strong>Quick add topic</strong>
      </button>

      {inboxCount > 0 ? (
        <span
          className={`quick-add__count${
            open ? " quick-add__count--hidden" : ""
          }`}
        >
          {inboxCount} in Inbox
        </span>
      ) : null}

      {open ? (
        <form className="quick-add__form" action={formAction}>
          <div className="quick-add__header">
            <div>
              <span className="quick-add__eyebrow">Capture for later</span>
              <h3>Quick add topic</h3>
            </div>
            <button
              className="quick-add__close"
              type="button"
              aria-label="Close quick add"
              onClick={() => setOpen(false)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="quick-add__status">
            <Inbox size={14} aria-hidden="true" />
            <span>Status</span>
            <strong>Inbox</strong>
          </div>

          <label className="quick-add__field">
            <span>
              Title <i>Required</i>
            </span>
            <input
              ref={inputRef}
              name="title"
              required
              placeholder="Topic title"
              aria-invalid={state?.field === "title"}
            />
          </label>

          <div className="quick-add__row">
            <label className="quick-add__field">
              <span>Category</span>
              <input
                name="category"
                placeholder="e.g. Applied AI"
              />
            </label>
            <label className="quick-add__field">
              <span>Difficulty</span>
              <select name="difficulty" defaultValue="beginner">
                {topicDifficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="quick-add__field">
            <span>Short description</span>
            <textarea
              name="shortDescription"
              rows={2}
              placeholder="A quick note about this topic"
            />
          </label>

          {state?.error ? (
            <p className="quick-add__error" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="quick-add__actions">
            <button
              className="quick-add__cancel"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={pending}>
              <Plus size={14} aria-hidden="true" />
              {pending ? "Adding…" : "Add to inbox"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
