import { createBlock, serialize } from "@wordpress/blocks";
import { registerCoreBlocks } from "@wordpress/block-library";
import { markdownToBlocks } from "./markdown.js";

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
