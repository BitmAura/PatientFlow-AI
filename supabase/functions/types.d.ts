
// This file is to suppress TypeScript errors in the editor when the Deno extension is not installed.
// The actual runtime environment (Deno) provides the global Deno object.

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
