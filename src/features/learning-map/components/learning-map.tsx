"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { QuickAddInboxForm } from "@/features/learning-map/components/quick-add-inbox-form";
import type { Topic, TopicRelation } from "@/features/topics/types";

const LearningMapCanvas = dynamic(
  () =>
    import("@/features/learning-map/components/learning-map-canvas").then(
      (mod) => mod.LearningMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="map-canvas__pending"
        role="status"
        aria-label="Loading learning map"
      />
    ),
  },
);

type LearningMapProps = {
  topics: Topic[];
  topicRelations: TopicRelation[];
  isAdmin?: boolean;
};

export function LearningMap({
  topics,
  topicRelations,
  isAdmin = false,
}: LearningMapProps) {
  const router = useRouter();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const inboxCount = topics.filter((topic) => topic.status === "inbox").length;

  const openTopic = useCallback(
    (slug: string) => {
      router.push(`/topics/${slug}`);
    },
    [router],
  );

  return (
    <section className="map-shell" aria-labelledby="learning-map-title">
      <div className="map-toolbar">
        <div>
          <div className="map-toolbar__eyebrow">
            <span className="live-dot" aria-hidden="true" />
            Structured learning map
          </div>
          <h2 id="learning-map-title">Follow the ideas, not a syllabus.</h2>
        </div>

        <div className="map-toolbar__aside">
          <div className="relation-legend" aria-label="Relationship legend">
            <span>
              <i className="legend-line legend-line--arrow" aria-hidden="true" />
              Prerequisite
            </span>
            <span>
              <i className="legend-line legend-line--related" aria-hidden="true" />
              Related
            </span>
          </div>
          {isAdmin ? <QuickAddInboxForm inboxCount={inboxCount} /> : null}
        </div>
      </div>

      <div className="map-canvas" data-testid="learning-map">
        <LearningMapCanvas
          topics={topics}
          topicRelations={topicRelations}
          selectedTopicId={selectedTopicId}
          onSelectTopic={setSelectedTopicId}
          onOpenTopic={openTopic}
        />

        <div className="map-selection" aria-live="polite">
          <span className="map-selection__label">Selected</span>
          <strong data-testid="selected-topic">
            {selectedTopic?.title ?? "Choose a topic"}
          </strong>
          <span className="map-selection__meta">
            {selectedTopic
              ? selectedTopic.status === "inbox"
                ? "Inbox · not connected yet"
                : `${selectedTopic.category} · ${selectedTopic.difficulty}`
              : "Click any node to focus it"}
          </span>
          {selectedTopic ? (
            <Link
              className="map-selection__open"
              href={`/topics/${selectedTopic.slug}`}
              data-testid="open-topic"
            >
              Open topic
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
