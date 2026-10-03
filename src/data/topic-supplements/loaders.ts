import type { ContentBlock } from "@/entities/course/model/types";

type SupplementLoader = () => Promise<ContentBlock[]>;

const loaders: Record<string, SupplementLoader> = {
  vectors: () =>
    import("./vectors").then((module) =>
      module.vectorFoundationSupplement.map((block) => ({ ...block, source: "supplement" as const })),
    ),
  "linear-spaces": () =>
    import("./linear-spaces").then((module) =>
      module.linearSpacesSupplement.map((block) => ({ ...block, source: "supplement" as const })),
    ),
};

export async function loadTopicSupplement(topicId: string): Promise<ContentBlock[]> {
  const loader = loaders[topicId];
  return loader ? loader() : [];
}
