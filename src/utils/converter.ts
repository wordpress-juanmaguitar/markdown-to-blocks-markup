import { marked } from "marked";
import { createBlock, serialize, serializeRawBlock } from "@wordpress/blocks";
import "../blocky-formats/vendor/commonmark.min.js";
import { markdownToBlocks } from "../blocky-formats/src/markdown.js";

import { registerCoreBlocks } from "@wordpress/block-library";

registerCoreBlocks();
const createBlocks = (blocks) =>
  blocks.map((block) =>
    createBlock(block.name, block.attributes, createBlocks(block.innerBlocks))
  );

export function convertToWordPressBlocks(markdown: string): string {
  const rawBlocks = markdownToBlocks(markdown);
  const editorBlocks = createBlocks(rawBlocks);
  const content = serialize(editorBlocks);

  return content;
}
