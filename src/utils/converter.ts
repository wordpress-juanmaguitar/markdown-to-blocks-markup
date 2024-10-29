import { createBlock, serialize, serializeRawBlock } from "@wordpress/blocks";
import { registerCoreBlocks } from "@wordpress/block-library";
import { markdownToBlocks } from "./markdown/index.ts";

import type { Block } from "./markdown/index.ts";

interface EditorBlock {
  clientId: string;
  name: string;
  isValid: boolean;
  attributes: Record<string, string | number | boolean | null>;
  innerBlocks: EditorBlock[];
}

registerCoreBlocks();

const createBlocks = (blocks: Block[]): EditorBlock[] =>
  blocks.map((block) =>
    createBlock(block.name, block.attributes, createBlocks(block.innerBlocks))
  );

export function convertToWordPressBlocks(markdown: string): string {
  const rawBlocks = markdownToBlocks(markdown);
  const editorBlocks = createBlocks(rawBlocks);
  const content = serialize(editorBlocks);

  return content;
}
