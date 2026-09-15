import { ArrowDownRight, Network } from "lucide-react";

import { LearningMap } from "@/features/learning-map/components/learning-map";
import { topics } from "@/features/topics/data/topics";

export default function Home() {
  const visibleTopicCount = topics.filter(
    (topic) => topic.status !== "inbox",
  ).length;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Synapse home">
          <span className="brand__mark" aria-hidden="true">
            <Network size={18} strokeWidth={1.8} />
          </span>
          <span>Synapse</span>
        </a>

        <nav aria-label="Primary navigation">
          <a className="nav-link nav-link--active" href="#learning-map">
            Learning map
          </a>
          <span className="nav-meta">{visibleTopicCount} topics</span>
        </nav>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero__copy">
          <p className="eyebrow">AI Study Group · Shared curriculum</p>
          <h1 id="page-title">
            Learn AI together,
            <br />
            <span>one connection at a time.</span>
          </h1>
          <p className="hero__description">
            Explore the map to see what comes first, what connects, and where
            the group is learning now.
          </p>
        </div>

        <a className="explore-cue" href="#learning-map">
          Explore the map
          <ArrowDownRight size={18} aria-hidden="true" />
        </a>
      </section>

      <section id="learning-map" className="map-section">
        <div className="status-legend" aria-label="Topic status legend">
          <span><i className="status-dot status-dot--discussed" />Discussed</span>
          <span><i className="status-dot status-dot--learning" />Learning now</span>
          <span><i className="status-dot status-dot--to-learn" />To learn</span>
        </div>
        <LearningMap />
      </section>

      <footer>
        <span>AI Study Group</span>
        <span>Map v1 · Read flow</span>
      </footer>
    </main>
  );
}
