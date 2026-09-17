import {
  MarkerType,
  Position,
  type Edge,
  type Node,
} from "@xyflow/react";

import type {
  Topic,
  TopicRelation,
  TopicRelationType,
} from "@/features/topics/types";

export type TopicNodeData = {
  topic: Topic;
  isCurrentArea: boolean;
} & Record<string, unknown>;

export type RelationEdgeData = {
  relationType: TopicRelationType;
} & Record<string, unknown>;

export type LearningMapNode = Node<TopicNodeData, "topic">;
export type LearningMapEdge = Edge<RelationEdgeData>;

export const NODE_WIDTH = 238;
export const NODE_HEIGHT = 114;
const COLUMN_GAP = 96;
const ROW_GAP = 52;
const SATELLITE_GAP = 80;

const HANDLE = {
  in: "in",
  out: "out",
  fromTop: "from-top",
  toBottom: "to-bottom",
} as const;

function median(values: number[]) {
  const sorted = [...values].toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function getPrerequisiteDepths(topics: Topic[], relations: TopicRelation[]) {
  const depths = new Map(topics.map((topic) => [topic.id, 0]));
  const prerequisites = relations.filter(
    (relation) => relation.type === "prerequisite",
  );

  for (let pass = 0; pass < topics.length; pass += 1) {
    let changed = false;

    prerequisites.forEach((relation) => {
      const sourceDepth = depths.get(relation.sourceTopicId) ?? 0;
      const targetDepth = depths.get(relation.targetTopicId) ?? 0;
      const nextDepth = Math.max(targetDepth, sourceDepth + 1);

      if (nextDepth !== targetDepth) {
        depths.set(relation.targetTopicId, nextDepth);
        changed = true;
      }
    });

    if (!changed) {
      break;
    }
  }

  return depths;
}

function hasPrerequisiteLink(topicId: string, relations: TopicRelation[]) {
  return relations.some(
    (relation) =>
      relation.type === "prerequisite" &&
      (relation.sourceTopicId === topicId || relation.targetTopicId === topicId),
  );
}

function assignColumns(
  topics: Topic[],
  relations: TopicRelation[],
  depths: Map<string, number>,
) {
  const columns = new Map<string, number>();

  topics.forEach((topic) => {
    if (hasPrerequisiteLink(topic.id, relations)) {
      columns.set(topic.id, depths.get(topic.id) ?? 0);
      return;
    }

    const neighborColumns = relations
      .filter(
        (relation) =>
          relation.type === "related" &&
          (relation.sourceTopicId === topic.id ||
            relation.targetTopicId === topic.id),
      )
      .map((relation) => {
        const neighborId =
          relation.sourceTopicId === topic.id
            ? relation.targetTopicId
            : relation.sourceTopicId;

        return depths.get(neighborId) ?? 0;
      });

    columns.set(
      topic.id,
      neighborColumns.length > 0
        ? Math.round(median(neighborColumns))
        : (depths.get(topic.id) ?? 0),
    );
  });

  return columns;
}

function barycenterOrder(
  topics: Topic[],
  columns: Map<string, number>,
  relations: TopicRelation[],
) {
  const prerequisites = relations.filter(
    (relation) => relation.type === "prerequisite",
  );
  const titles = new Map(topics.map((topic) => [topic.id, topic.title]));
  const order = new Map<number, string[]>();

  topics.forEach((topic) => {
    const column = columns.get(topic.id) ?? 0;
    order.set(column, [...(order.get(column) ?? []), topic.id]);
  });

  for (const [column, ids] of order) {
    order.set(
      column,
      ids.toSorted((a, b) =>
        (titles.get(a) ?? a).localeCompare(titles.get(b) ?? b),
      ),
    );
  }

  const neighbors = (id: string, direction: "in" | "out") =>
    prerequisites
      .filter((relation) =>
        direction === "in"
          ? relation.targetTopicId === id
          : relation.sourceTopicId === id,
      )
      .map((relation) =>
        direction === "in" ? relation.sourceTopicId : relation.targetTopicId,
      );

  for (let pass = 0; pass < 4; pass += 1) {
    const indexes = new Map<string, number>();
    for (const ids of order.values()) {
      ids.forEach((id, index) => indexes.set(id, index));
    }

    const columnKeys = [...order.keys()].toSorted((a, b) => a - b);
    const sweep = pass % 2 === 0 ? columnKeys : [...columnKeys].reverse();
    const direction = pass % 2 === 0 ? "in" : "out";

    sweep.forEach((column) => {
      const ids = order.get(column) ?? [];
      const scored = ids.map((id, index) => {
        const connected = neighbors(id, direction).filter((neighbor) =>
          indexes.has(neighbor),
        );
        const score =
          connected.length > 0
            ? connected.reduce(
                (total, neighbor) => total + (indexes.get(neighbor) ?? 0),
                0,
              ) / connected.length
            : index;

        return { id, score, index };
      });

      order.set(
        column,
        scored
          .toSorted((a, b) => a.score - b.score || a.index - b.index)
          .map((entry) => entry.id),
      );
    });
  }

  return order;
}

function layoutTopics(topics: Topic[], relations: TopicRelation[]) {
  const depths = getPrerequisiteDepths(topics, relations);
  const columns = assignColumns(topics, relations, depths);
  const relatedOnly = topics.filter(
    (topic) => !hasPrerequisiteLink(topic.id, relations),
  );
  const mainTopics = topics.filter((topic) =>
    hasPrerequisiteLink(topic.id, relations),
  );
  const order = barycenterOrder(mainTopics, columns, relations);
  const positions = new Map<string, { x: number; y: number }>();
  const xFor = (column: number) => column * (NODE_WIDTH + COLUMN_GAP);

  [...order.keys()]
    .toSorted((a, b) => a - b)
    .forEach((column) => {
      const ids = order.get(column) ?? [];
      const preferred = ids.map((id, index) => {
        const connected = relations
          .filter(
            (relation) =>
              relation.type === "prerequisite" &&
              (relation.sourceTopicId === id || relation.targetTopicId === id),
          )
          .map((relation) =>
            relation.sourceTopicId === id
              ? relation.targetTopicId
              : relation.sourceTopicId,
          )
          .filter((neighborId) => positions.has(neighborId));

        if (connected.length > 0) {
          return median(
            connected.map((neighborId) => positions.get(neighborId)!.y),
          );
        }

        return index * (NODE_HEIGHT + ROW_GAP);
      });

      const ys: number[] = [];
      ids.forEach((_, index) => {
        if (index === 0) {
          ys.push(preferred[index]);
          return;
        }

        ys.push(
          Math.max(preferred[index], ys[index - 1] + NODE_HEIGHT + ROW_GAP),
        );
      });

      ids.forEach((id, index) => {
        positions.set(id, { x: xFor(column), y: ys[index] });
      });
    });

  const relatedByColumn = new Map<number, Topic[]>();
  relatedOnly.forEach((topic) => {
    const column = columns.get(topic.id) ?? 0;
    relatedByColumn.set(column, [...(relatedByColumn.get(column) ?? []), topic]);
  });

  for (const [column, group] of relatedByColumn) {
    const neighborYs = group.flatMap((topic) =>
      relations
        .filter(
          (relation) =>
            relation.type === "related" &&
            (relation.sourceTopicId === topic.id ||
              relation.targetTopicId === topic.id),
        )
        .map((relation) =>
          relation.sourceTopicId === topic.id
            ? relation.targetTopicId
            : relation.sourceTopicId,
        )
        .map((neighborId) => positions.get(neighborId)?.y)
        .filter((y): y is number => y != null),
    );
    const baseY =
      (neighborYs.length > 0 ? Math.min(...neighborYs) : 0) -
      NODE_HEIGHT -
      SATELLITE_GAP;

    group
      .toSorted((a, b) => a.title.localeCompare(b.title))
      .forEach((topic, index) => {
        positions.set(topic.id, {
          x: xFor(column),
          y: baseY - index * (NODE_HEIGHT + ROW_GAP),
        });
      });
  }

  return positions;
}

function columnIndex(x: number) {
  return Math.round(x / (NODE_WIDTH + COLUMN_GAP));
}

function relatedEdgeRouting(
  relation: TopicRelation,
  positions: Map<string, { x: number; y: number }>,
) {
  const originalSource = positions.get(relation.sourceTopicId) ?? { x: 0, y: 0 };
  const originalTarget = positions.get(relation.targetTopicId) ?? { x: 0, y: 0 };
  const aligned = Math.abs(originalSource.x - originalTarget.x) < 1;

  if (aligned) {
    const sourceIsLower = originalSource.y >= originalTarget.y;

    return {
      source: sourceIsLower ? relation.sourceTopicId : relation.targetTopicId,
      target: sourceIsLower ? relation.targetTopicId : relation.sourceTopicId,
      sourceHandle: HANDLE.fromTop,
      targetHandle: HANDLE.toBottom,
      aligned: true,
    };
  }

  const sourceIsLeft = originalSource.x <= originalTarget.x;

  return {
    source: sourceIsLeft ? relation.sourceTopicId : relation.targetTopicId,
    target: sourceIsLeft ? relation.targetTopicId : relation.sourceTopicId,
    sourceHandle: HANDLE.out,
    targetHandle: HANDLE.in,
    aligned: false,
  };
}

export function buildLearningMap(
  allTopics: Topic[],
  allRelations: TopicRelation[],
): { nodes: LearningMapNode[]; edges: LearningMapEdge[] } {
  const visibleTopics = allTopics.filter((topic) => topic.status !== "inbox");
  const visibleIds = new Set(visibleTopics.map((topic) => topic.id));
  const visibleRelations = allRelations.filter(
    (relation) =>
      visibleIds.has(relation.sourceTopicId) &&
      visibleIds.has(relation.targetTopicId),
  );
  const positions = layoutTopics(visibleTopics, visibleRelations);

  const nodes: LearningMapNode[] = visibleTopics.map((topic) => ({
    id: topic.id,
    type: "topic",
    position: positions.get(topic.id) ?? { x: 0, y: 0 },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      topic,
      isCurrentArea: topic.status === "learning",
    },
  }));

  const statusById = new Map(
    visibleTopics.map((topic) => [topic.id, topic.status]),
  );

  const edges: LearningMapEdge[] = visibleRelations.map((relation) => {
    const isPrerequisite = relation.type === "prerequisite";
    const isCompleted =
      isPrerequisite &&
      statusById.get(relation.sourceTopicId) === "discussed" &&
      statusById.get(relation.targetTopicId) === "discussed";
    const source = positions.get(relation.sourceTopicId) ?? { x: 0, y: 0 };
    const target = positions.get(relation.targetTopicId) ?? { x: 0, y: 0 };
    const related =
      relation.type === "related"
        ? relatedEdgeRouting(relation, positions)
        : null;
    const edgeSource = related?.source ?? relation.sourceTopicId;
    const edgeTarget = related?.target ?? relation.targetTopicId;
    const aligned =
      related?.aligned ??
      (Math.abs(source.x - target.x) < 1 || Math.abs(source.y - target.y) < 1);
    const skipsColumns =
      Math.abs(columnIndex(source.x) - columnIndex(target.x)) > 1;
    const sameRowSkip =
      skipsColumns && Math.abs(source.y - target.y) < NODE_HEIGHT / 2;

    return {
      id: relation.id,
      source: edgeSource,
      target: edgeTarget,
      sourceHandle:
        related?.sourceHandle ??
        (sameRowSkip ? HANDLE.fromTop : HANDLE.out),
      targetHandle: related?.targetHandle ?? HANDLE.in,
      type: aligned && !skipsColumns ? "straight" : "smoothstep",
      pathOptions: { offset: sameRowSkip ? 52 : 36, borderRadius: 14 },
      data: { relationType: relation.type },
      markerEnd: isPrerequisite
        ? {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: isCompleted
              ? "var(--edge-prerequisite-completed)"
              : "var(--edge-prerequisite)",
          }
        : undefined,
      animated: false,
      className: isPrerequisite
        ? `learning-edge learning-edge--prerequisite${
            isCompleted ? " learning-edge--completed" : ""
          }`
        : "learning-edge learning-edge--related",
      ariaLabel: isPrerequisite
        ? `${relation.sourceTopicId} is a prerequisite for ${relation.targetTopicId}`
        : `${relation.sourceTopicId} is related to ${relation.targetTopicId}`,
    };
  });

  return { nodes, edges };
}
