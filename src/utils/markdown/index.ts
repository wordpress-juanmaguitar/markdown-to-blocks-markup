/**
 * Convert between Markdown and WordPress Blocks.
 *
 * Depends on setting the `commonmark` global, an
 * exercise left up to the reader.
 */

import { markdownToBlocks, Block } from "./markdownToBlocks.ts";
import { blocks2markdown } from "./blocks2markdown.ts";

export { markdownToBlocks, blocks2markdown };
export type { Block };
