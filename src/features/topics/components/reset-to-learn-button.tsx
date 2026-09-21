"use client";

import { Ellipsis } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { resetTopicStatusToLearnAction } from "@/features/topics/actions";

type ResetToLearnMenuProps = {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
};

export function ResetToLearnMenu({
  topicId,
  topicSlug,
  topicTitle,
}: ResetToLearnMenuProps) {
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
        aria-label={`Status actions for ${topicTitle}`}
        data-testid={`reset-to-learn-${topicSlug}`}
        onClick={() => setOpen((current) => !current)}
      >
        <Ellipsis size={14} aria-hidden="true" />
      </button>
      {open ? (
        <form action={resetTopicStatusToLearnAction} id={menuId}>
          <input type="hidden" name="topicId" value={topicId} />
          <button type="submit">Mark as To Learn</button>
        </form>
      ) : null}
    </div>
  );
}
