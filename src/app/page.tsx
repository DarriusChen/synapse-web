import { SiteHeader } from "@/components/site-header";
import { LearningMap } from "@/features/learning-map/components/learning-map";

export default function Home() {
  return (
    <main>
      <SiteHeader active="map" />

      <section className="hero" aria-labelledby="page-title">
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
