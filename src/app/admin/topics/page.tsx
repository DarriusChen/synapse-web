import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { logoutAdminAction } from "@/features/admin/actions";
import { AdminTopicList } from "@/features/topics/components/admin-topic-list";
import { getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { readTopicStore } from "@/features/topics/lib/topic-store";

export const dynamic = "force-dynamic";

export default async function AdminTopicsPage() {
  const store = await readTopicStore();
  const topics = [...store.topics].toSorted((left, right) =>
    left.title.localeCompare(right.title),
  );
  const inboxTopics = topics.filter((topic) => topic.status === "inbox");
  const curriculumTopics = topics.filter(
    (topic) => topic.status !== "inbox",
  );
  const inboxCount = inboxTopics.length;

  return (
    <main className="topic-page">
      <SiteHeader
        active="admin"
        visibleTopicCount={getVisibleTopicCount(store.topics)}
      />

      <section className="admin-page">
        <div className="admin-page__header">
          <div>
            <p className="eyebrow">Topic management</p>
            <h1>Topics</h1>
          </div>
          <div className="admin-page__actions">
            <Link className="admin-page__action" href="/admin/topics/new">
              New topic
            </Link>
            <form action={logoutAdminAction}>
              <button className="admin-page__action" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div
          className={`admin-inbox-summary${
            inboxCount === 0 ? " admin-inbox-summary--clear" : ""
          }`}
        >
          <div>
            <span className="admin-inbox-summary__label">Topic Inbox</span>
            <strong>
              {inboxCount === 0
                ? "Inbox clear"
                : `${inboxCount} ${
                    inboxCount === 1 ? "topic needs" : "topics need"
                  } organizing`}
            </strong>
          </div>
          <p>
            {inboxCount === 0
              ? "Every captured topic has been organized."
              : "Complete the details and connect these topics to the learning map."}
          </p>
        </div>

        {inboxCount > 0 ? (
          <section className="admin-topic-group" aria-labelledby="inbox-heading">
            <div className="admin-topic-group__heading">
              <h2 id="inbox-heading">Inbox</h2>
              <span>{inboxCount}</span>
            </div>
            <AdminTopicList
              topics={inboxTopics}
              relations={store.topicRelations}
              actionLabel="Organize"
            />
          </section>
        ) : null}

        <section
          className="admin-topic-group"
          aria-labelledby="curriculum-heading"
        >
          <div className="admin-topic-group__heading">
            <h2 id="curriculum-heading">Curriculum</h2>
            <span>{curriculumTopics.length}</span>
          </div>
          <AdminTopicList
            topics={curriculumTopics}
            relations={store.topicRelations}
            actionLabel="Edit"
          />
        </section>
      </section>
    </main>
  );
}
