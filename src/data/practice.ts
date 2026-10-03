// Compatibility facade for the full practice registry.
//
// UI code should prefer the lazy loader under ./practice/loaders.
// Integrity checks and bulk tooling can continue importing practiceByTopic here.
export { practiceByTopic } from "./practice/index";
