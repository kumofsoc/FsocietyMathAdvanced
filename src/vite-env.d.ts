/// <reference types="vite/client" />

declare module "react-katex" {
  import type { ComponentType } from "react";
  export const BlockMath: ComponentType<{ math: string; errorColor?: string }>;
  export const InlineMath: ComponentType<{ math: string; errorColor?: string }>;
}


interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT_MS?: string;
  readonly VITE_REQUIRE_BACKEND?: string;
  readonly VITE_CLIENT_ERROR_ENDPOINT?: string;
  readonly VITE_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
