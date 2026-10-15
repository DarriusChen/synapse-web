"use client";

import { Ellipsis } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { deleteInboxTopicAction } from "@/features/topics/actions";

type DeleteInboxTopicProps = {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
};

function confirmDelete(topicTitle: string, event: FormEvent<HTMLFormElement>) {
  if (!window.confirm(`Delete “${topicTitle}” from the inbox?`)) {
    event.preventDefault();
  }
}

export function DeleteInboxTopicMenu({
  topicId,
  topicSlug,
  topicTitle,
}: DeleteInboxTopicProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function close() {
      setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="admin-topic-status-menu" ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={`Delete actions for ${topicTitle}`}
        data-testid={`delete-inbox-${topicSlug}`}
        onClick={() => setOpen((current) => !current)}
      >
        <Ellipsis size={14} aria-hidden="true" />
      </button>
      {open ? (
        <form
          action={deleteInboxTopicAction}
          id={menuId}
          onSubmit={(event) => confirmDelete(topicTitle, event)}
        >
          <input type="hidden" name="topicId" value={topicId} />
          <button className="admin-topic-status-menu__danger" type="submit">
            Delete
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function DeleteInboxTopicButton({
  topicId,
  topicSlug,
  topicTitle,
}: DeleteInboxTopicProps) {
  return (
    <form
      className="topic-delete"
      action={deleteInboxTopicAction}
      onSubmit={(event) => confirmDelete(topicTitle, event)}
    >
      <input type="hidden" name="topicId" value={topicId} />
      <button type="submit" data-testid={`delete-inbox-topic-${topicSlug}`}>
        Delete topic
      </button>
    </form>
  );
}
