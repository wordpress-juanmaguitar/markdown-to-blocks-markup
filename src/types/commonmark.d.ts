// node_modules/@types/commonmark/index.d.ts
import * as commonmark from "@types/commonmark";

declare module "commonmark" {
  export class Parser extends commonmark.Parser {}
  export class Node extends commonmark.Node {}
  export class Renderer extends commonmark.Renderer {}

  // node_modules/commonmark/lib/render/renderer.js;
  export class Renderer {
    constructor();
    /** Walks the AST and calls member methods for each Node type. */
    render(root: Node): string;

    /** Concatenate a literal string to the buffer. */
    lit: (str: string) => void;

    /** Output a newline to the buffer. */
    cr: () => void;

    /** Concatenate a string to the buffer possibly escaping the content.
     *  Concrete renderer implementations should override this method. */
    out: (s: string) => void;

    /** Escape a string for the target renderer.
     *  Abstract function that should be implemented by concrete
     *  renderer implementations. */
    esc: (s: string) => string;
  }
}
