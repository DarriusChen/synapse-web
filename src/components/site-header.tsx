import { Network } from "lucide-react";
import Link from "next/link";

import { getVisibleTopicCount } from "@/features/topics/lib/topic-detail";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  active?: "map";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  const visibleTopicCount = getVisibleTopicCount();

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
          href="/#learning-map"
        >
          Learning map
        </Link>
        <span className="nav-meta">{visibleTopicCount} topics</span>
      </nav>
    </header>
  );
}
