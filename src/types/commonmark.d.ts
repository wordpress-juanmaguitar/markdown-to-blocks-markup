// node_modules/@types/commonmark/index.d.ts
import * as commonmark from "@types/commonmark";

declare module "commonmark" {
  interface Node extends commonmark.Node {
    _description: string | null;
  }
}
