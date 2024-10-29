import * as commonmark from "commonmark";
const { Parser } = commonmark;

export interface Block {
  name: string;
  attributes: Record<string, string | number | boolean | null>;
  innerBlocks: Block[];
}

/**
 * Matches Jekyll-style front-matter at the start of a Markdown document.
 *
 * @see https://github.com/jekyll/jekyll/blob/1484c6d6a41196dcaa25daca9ed1f8c32083ff10/lib/jekyll/document.rb
 */
const frontMatterPattern: RegExp = /---\s*\n(.*?)\n?(?:---|\.\.\.)\s*\n/sy;

/**
 * Escape a string for use in HTML content.
 *
 * @param {string} s
 * @return {string}
 */
const escapeHTML = (s: string): string =>
  s.replace(/[<&>'"]/g, (m) => {
    switch (m[0]) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return m;
    }
  });

/**
 * Converts a CommonMark AST into an array of WordPress Blocks.
 *
 * This function walks through the given CommonMark abstract syntax tree (AST),
 * extracts the nodes, and transforms them into WordPress block structures.
 * The resulting blocks are collected within a root block and returned as an array.
 *
 * @param {commonmark.Node} ast - The CommonMark AST to be converted.
 * @returns {Block[]} An array of WordPress Blocks derived from the AST.
 * @throws Will throw an error if the AST does not contain any nodes.
 */
const fromAstToWPBlocks = (ast: commonmark.Node): Block[] => {
  const block: Block = {
    name: "root",
    attributes: {},
    innerBlocks: [],
  };
  let event: commonmark.NodeWalkingStep | null;
  let lastNode: commonmark.Node | null = null;
  const walker: commonmark.NodeWalker = ast.walker();

  while ((event = walker.next())) {
    lastNode = event?.node;
  }
  if (!lastNode) {
    throw new Error("No last node");
  }
  nodeToBlock(block, lastNode.firstChild!);
  return block.innerBlocks;
};

/**
 * Transforms a CommonMark node into a WordPress Block and appends it to a parent block.
 *
 * This function iterates over the provided CommonMark node, converts it into a WordPress block
 * based on its type, and recursively processes its children if necessary. The resulting block
 * is then added to the parent block's inner blocks.
 *
 * @param {Block} parentBlock - The parent block to which the converted block is appended.
 * @param {commonmark.Node} node - The CommonMark node to be converted into a WordPress Block.
 */
const nodeToBlock = (parentBlock: Block, node: commonmark.Node): void => {
  const add = (block: Block): void => {
    parentBlock.innerBlocks.push(block);
  };

  const block = {
    name: "",
    attributes: {},
    innerBlocks: [] as Block[],
  } as Block;
  let skipChildren = false;

  switch (node.type) {
    case "document":
      return;
    case "image": {
      block.name = "core/image";
      block.attributes.url = node.destination;
      if (node._description) block.attributes.alt = node._description;
      if (node.title) block.attributes.title = node.title;
      break;
    }
    case "list": {
      block.name = "core/list";
      block.attributes.ordered = node.listType === "ordered";
      if (node.listStart && node.listStart !== 1) {
        block.attributes.start = node.listStart;
      }
      break;
    }
    case "block_quote": {
      block.name = "core/quote";
      break;
    }
    case "item": {
      block.name = "core/list-item";
      let innerNode = node.firstChild;
      while (innerNode) {
        if (innerNode.type === "paragraph") {
          block.attributes.content = inlineBlocksToHTML(
            "",
            innerNode.firstChild
          );
        } else if (innerNode.type === "list") {
          nodeToBlock(block, innerNode);
        }
        innerNode = innerNode.next;
      }
      skipChildren = true;
      break;
    }
    case "heading": {
      block.name = "core/heading";
      block.attributes.level = node.level;
      block.attributes.content = inlineBlocksToHTML("", node.firstChild);
      skipChildren = true;
      break;
    }
    case "thematic_break": {
      block.name = "core/separator";
      break;
    }
    case "code_block": {
      block.name = "core/code";
      if (typeof node.info === "string" && node.info !== "") {
        block.attributes.language = node.info.replace(/[ \t\r\n\f].*/, "");
      }
      if (node.literal) {
        block.attributes.content = node.literal.trim().replace(/\n/g, "<br>");
      }
      break;
    }
    case "html_block": {
      block.name = "core/html";
      block.attributes.content = node.literal;
      break;
    }
    case "paragraph": {
      if (
        node.firstChild &&
        node.firstChild.type === "image" &&
        !node.firstChild.next
      ) {
        const image = node.firstChild;
        block.name = "core/image";
        block.attributes.url = image.destination;
        block.attributes.caption =
          image.title || inlineBlocksToHTML("", image.firstChild);
        if (image._description) block.attributes.alt = image._description;
        skipChildren = true;
        break;
      }
      block.name = "core/paragraph";
      block.attributes.content = inlineBlocksToHTML("", node.firstChild);
      skipChildren = true;
      break;
    }
    default:
      console.log(node);
  }

  add(block);

  if (!skipChildren && node.firstChild) {
    nodeToBlock(block, node.firstChild);
  }

  if (node.next) {
    nodeToBlock(parentBlock, node.next);
  }
};

/**
 * Recursively traverse a CommonMark inline node and convert it into an
 * HTML string.
 *
 * @param {string} html - The HTML string to append to.
 * @param {commonmark.Node | null} node - The CommonMark node to convert.
 * @return {string} The resulting HTML string.
 */
const inlineBlocksToHTML = (
  html: string,
  node: commonmark.Node | null
): string => {
  if (!node) return html;

  const add = (s: string): void => {
    html += s;
  };

  const surround = (before: string, after: string): void => {
    if (!node.firstChild) return;
    add(before + inlineBlocksToHTML("", node.firstChild) + after);
  };

  const addTag = (
    tag: string,
    tagAttrs?: Record<string, string | null>
  ): void => {
    const attrs = tagAttrs
      ? " " +
        Object.entries(tagAttrs)
          .filter(([, value]) => value !== null)
          .map(([name, value]) => `${name}="${value}"`)
          .join(" ")
      : "";
    const isVoid = tag === "img";
    surround(`<${tag}${attrs}>`, isVoid ? "" : `</${tag}>`);
  };

  switch (node.type) {
    case "code": {
      if (node.literal) {
        add(`<code>${escapeHTML(node.literal)}</code>`);
      }
      break;
    }
    case "emph": {
      addTag("em");
      break;
    }
    case "html_inline": {
      if (node.literal) {
        add(escapeHTML(node.literal));
      }
      break;
    }
    case "image": {
      addTag("img", {
        src: node.destination,
        title: node.title || null,
        alt: node._description || null,
      });
      break;
    }
    case "link": {
      addTag("a", { href: node.destination, title: node.title || null });
      break;
    }
    case "softbreak": {
      add("<br>");
      break;
    }
    case "strong": {
      addTag("strong");
      break;
    }
    case "text": {
      if (node.literal) {
        add(node.literal);
      }
      break;
    }
    default:
      console.log(node);
  }

  if (node.next) return inlineBlocksToHTML(html, node.next);

  return html;
};

/**
 * Convert a Markdown document to an array of WordPress Gutenberg Blocks.
 * @param input - The Markdown document to convert.
 * @returns An array of WordPress Gutenberg Blocks.
 */
export const markdownToBlocks = (input: string): Block[] => {
  const frontMatterMatch = frontMatterPattern.exec(input);
  const foundFrontMatter = frontMatterMatch !== null;
  // const frontMatter = foundFrontMatter ? frontMatterMatch[1] : null;
  const markdownDocument = foundFrontMatter
    ? input.slice(frontMatterMatch[0].length)
    : input;
  frontMatterPattern.lastIndex = 0;

  const parser = new Parser();
  const ast = parser.parse(markdownDocument);

  return fromAstToWPBlocks(ast);
};
