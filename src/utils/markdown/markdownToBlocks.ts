import * as commonmark from "commonmark";
const { Parser, Renderer } = commonmark;

/**
 * Matches Jekyll-style front-matter at the start of a Markdown document.
 *
 * @see https://github.com/jekyll/jekyll/blob/1484c6d6a41196dcaa25daca9ed1f8c32083ff10/lib/jekyll/document.rb
 */
const frontMatterPattern: RegExp = /---\s*\n(.*?)\n?(?:---|\.\.\.)\s*\n/sy;

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

const render = (ast: any): any[] => {
  const blocks = { name: "root", attributes: {}, innerBlocks: [] as any[] };
  let event;
  let lastNode;
  const walker = ast.walker();

  while ((event = walker.next())) {
    lastNode = event.node;
  }

  if (lastNode.type !== "document") {
    throw new Error("Expected a document node");
  }

  nodeToBlock(blocks, lastNode.firstChild);
  return blocks.innerBlocks;
};

const nodeToBlock = (parentBlock: any, node: any): void => {
  const add = (block: any): void => {
    parentBlock.innerBlocks.push(block);
  };

  const block = { name: "", attributes: {}, innerBlocks: [] as any[] };
  let skipChildren = false;

  switch (node.type || null) {
    case "document":
      return;
    case "image":
      block.name = "core/image";
      block.attributes.url = node._destination;
      if (node._description) block.attributes.alt = node._description;
      if (node._title) block.attributes.title = node._title;
      break;
    case "list":
      block.name = "core/list";
      block.attributes.ordered = node._listData.type === "ordered";
      if (node._listData.start && node._listData.start !== 1) {
        block.attributes.start = node._listData.start;
      }
      break;
    case "block_quote":
      block.name = "core/quote";
      break;
    case "item":
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
    case "heading":
      block.name = "core/heading";
      block.attributes.level = node.level;
      block.attributes.content = inlineBlocksToHTML("", node.firstChild);
      skipChildren = true;
      break;
    case "thematic_break":
      block.name = "core/separator";
      break;
    case "code_block":
      block.name = "core/code";
      if (typeof node.info === "string" && node.info !== "") {
        block.attributes.language = node.info.replace(/[ \t\r\n\f].*/, "");
      }
      block.attributes.content = node.literal.trim().replace(/\n/g, "<br>");
      break;
    case "html_block":
      block.name = "core/html";
      block.attributes.content = node.literal;
      break;
    case "paragraph":
      if (
        node.firstChild &&
        node.firstChild.type === "image" &&
        !node.firstChild.next
      ) {
        const image = node.firstChild;
        block.name = "core/image";
        block.attributes.url = image._destination;
        block.attributes.caption =
          image._title || inlineBlocksToHTML("", image.firstChild);
        if (image._description) block.attributes.alt = image._description;
        skipChildren = true;
        break;
      }
      block.name = "core/paragraph";
      block.attributes.content = inlineBlocksToHTML("", node.firstChild);
      skipChildren = true;
      break;
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

const inlineBlocksToHTML = (html: string, node: any): string => {
  if (!node) return html;

  const add = (s: string): void => {
    html += s;
  };

  const surround = (before: string, after: string): void => {
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
    case "code":
      add(`<code>${escapeHTML(node.literal)}</code>`);
      break;
    case "emph":
      addTag("em");
      break;
    case "html_inline":
      add(escapeHTML(node.literal));
      break;
    case "image":
      addTag("img", {
        src: node._destination,
        title: node._title || null,
        alt: node._description || null,
      });
      break;
    case "link":
      addTag("a", { href: node._destination, title: node._title || null });
      break;
    case "softbreak":
      add("<br>");
      break;
    case "strong":
      addTag("strong");
      break;
    case "text":
      add(node.literal);
      break;
    default:
      console.log(node);
  }

  if (node.next) return inlineBlocksToHTML(html, node.next);

  return html;
};

class WpBlocksRenderer extends Renderer {
  options: object;
  constructor(options: object) {
    super();
    this.options = options;
  }

  get render() {
    return render;
  }

  esc(s: string): string {
    return s;
  }
}

export const markdownToBlocks = (input: string): any[] => {
  const frontMatterMatch = frontMatterPattern.exec(input);
  const foundFrontMatter = frontMatterMatch !== null;
  // const frontMatter = foundFrontMatter ? frontMatterMatch[1] : null;
  const markdownDocument = foundFrontMatter
    ? input.slice(frontMatterMatch[0].length)
    : input;
  frontMatterPattern.lastIndex = 0;

  const parser = new Parser();
  const ast = parser.parse(markdownDocument);
  const blockRenderer = new WpBlocksRenderer({ sourcepos: true });

  return blockRenderer.render(ast);
};
