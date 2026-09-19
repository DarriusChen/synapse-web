import { SiteHeader } from "@/components/site-header";
import { LearningMap } from "@/features/learning-map/components/learning-map";
import { getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";
import { hasAdminSession } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [store, isAdmin] = await Promise.all([
    readTopicStore(),
    hasAdminSession(),
  ]);

  return (
    <main>
      <SiteHeader
        active="map"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />

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
          <span><i className="status-dot status-dot--inbox" />Inbox</span>
        </div>
        <LearningMap
          topics={store.topics}
          topicRelations={store.topicRelations}
          isAdmin={isAdmin}
        />
      </section>

      <footer>
        <span>AI Study Group</span>
        <span>Map v1 · Topic management</span>
      </footer>
    </main>
  );
}
