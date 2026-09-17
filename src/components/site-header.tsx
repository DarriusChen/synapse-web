import { Network } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  active?: "map" | "admin" | "topics";
  visibleTopicCount?: number;
};

export function SiteHeader({ active, visibleTopicCount }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Synapse home">
        <span className="brand__mark" aria-hidden="true">
          <Network size={18} strokeWidth={1.8} />
        </span>
        <span>Synapse</span>
      </Link>

      <nav aria-label="Primary navigation">
        <Link
          className={cn("nav-link", active === "map" && "nav-link--active")}
          href={active === "map" ? "/#learning-map" : "/"}
        >
          Learning map
        </Link>
        <Link
          className={cn("nav-link", active === "admin" && "nav-link--active")}
          href="/admin/topics"
        >
          Admin
        </Link>
        {visibleTopicCount != null ? (
          <Link
            className={cn(
              "nav-link",
              "nav-meta",
              active === "topics" && "nav-link--active",
            )}
            href="/topics"
          >
            {visibleTopicCount} topics
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
