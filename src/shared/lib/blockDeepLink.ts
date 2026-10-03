export type BlockDeepLink = {
  route: string;
  topicId: string | null;
  blockIndex: number | null;
};

export function parseVisualMathHash(hash: string): BlockDeepLink {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) {
    return { route: "home", topicId: null, blockIndex: null };
  }

  const match = raw.match(/^([^/]+)\/block\/(\d+)$/);
  if (!match) {
    return { route: decodeURIComponent(raw), topicId: null, blockIndex: null };
  }

  const topicId = decodeURIComponent(match[1]);
  const blockIndex = Number(match[2]);

  return {
    route: topicId,
    topicId,
    blockIndex: Number.isInteger(blockIndex) && blockIndex >= 0 ? blockIndex : null,
  };
}

export function buildBlockHash(topicId: string, blockIndex: number) {
  return (
    "#" +
    encodeURIComponent(topicId) +
    "/block/" +
    Math.max(0, Math.trunc(blockIndex))
  );
}

export function buildBlockDeepLink(
  currentUrl: string,
  topicId: string,
  blockIndex: number,
) {
  const url = new URL(currentUrl);
  url.hash = buildBlockHash(topicId, blockIndex);
  return url.toString();
}
