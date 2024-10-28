const htmlToMarkdown = (html: string): string => {
  const node: HTMLElement = document.createElement("div");
  node.innerHTML = html;

  node.querySelectorAll("b, strong").forEach((fontNode: Element) => {
    fontNode.innerHTML = `**${fontNode.innerHTML}**`;
  });

  node.querySelectorAll("i, em").forEach((fontNode: Element) => {
    fontNode.innerHTML = `*${fontNode.innerHTML}*`;
  });

  node.querySelectorAll("code").forEach((codeNode: Element) => {
    codeNode.innerHTML = `\`${codeNode.innerHTML}\``;
  });

  node.querySelectorAll("a").forEach((linkNode: Element) => {
    linkNode.outerHTML = `[${linkNode.innerText}](${linkNode.getAttribute(
      "href"
    )})`;
  });

  node.querySelectorAll("br").forEach((brNode: Element) => {
    brNode.outerHTML = "\n";
  });

  return node.innerText;
};

const longestSequenceOf = (input: string, substring: string): number => {
  let longestChain = substring;
  let nextAt = 0;

  while (-1 !== (nextAt = input.indexOf(longestChain, nextAt))) {
    nextAt += substring.length;
    longestChain += substring;
  }

  return longestChain.length / substring.length - 1;
};

const blockToMarkdown = (state: any, block: any): string => {
  const romanize = (num: number): string => {
    const digits = String(+num).split("");
    const key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ];
    let roman = "";
    let i = 3;
    while (i--) {
      roman = (key[+digits.pop() + i * 10] || "") + roman;
    }
    return Array(+digits.join("") + 1).join("M") + roman;
  };

  const indent = (s: string): string => {
    if (0 === state.indent.length) {
      return s;
    }

    const indentStr = state.indent.join("");
    let at = 0;
    let last = 0;
    let out = "";

    while (at < s.length) {
      const nextAt = s.indexOf("\n", at);

      if (-1 === nextAt) {
        out += indentStr + s.slice(at);
        break;
      }

      if (nextAt === last + 1) {
        out += "\n";
        at++;
        last = at;
        continue;
      }

      out += indentStr + s.slice(at, nextAt + 1);
      at = nextAt + 1;
      last = at;
    }

    return out;
  };

  switch (block.name) {
    case "core/quote": {
      const content = blocksToMarkdown(state, block.innerBlocks);
      return (
        content
          .split("\n")
          .map((l: string) => `> ${l}`)
          .join("\n") + "\n\n"
      );
    }

    case "core/code": {
      const code = htmlToMarkdown(block.attributes.content);
      const languageSpec = block.attributes.language || "";
      const fence = "`".repeat(Math.max(3, longestSequenceOf(code, "`") + 1));
      return `${fence}${languageSpec}\n${code}\n${fence}\n\n`;
    }

    case "core/image":
      return `![${block.attributes.alt}](${block.attributes.url})\n\n`;

    case "core/heading":
      return `${"#".repeat(block.attributes.level)} ${htmlToMarkdown(
        block.attributes.content
      )}\n\n`;

    case "core/list": {
      state.listStyle.push({
        style: block.attributes.ordered
          ? block.attributes.type || "decimal"
          : "-",
        count: block.attributes.start || 1,
      });
      const list = blocksToMarkdown(state, block.innerBlocks);
      state.listStyle.pop();
      return `${list}\n\n`;
    }

    case "core/list-item": {
      if (0 === state.listStyle.length) {
        return "";
      }

      const item = state.listStyle[state.listStyle.length - 1];
      const bullet = (() => {
        switch (item.style) {
          case "-":
            return "-";
          case "decimal":
            return `${item.count.toString()}.`;
          case "upper-alpha":
            return `${String.fromCharCode(64 + item.count)}.`;
          case "lower-alpha":
            return `${String.fromCharCode(96 + item.count)}.`;
          case "upper-roman":
            return romanize(item.count) + ".";
          case "lower-roman":
            return romanize(item.count).toLowerCase();
          default:
            return `${item.count.toString()}.`;
        }
      })();

      item.count++;
      const bulletIndent = " ".repeat(bullet.length + 1);

      const [firstLine, ...restLines] = htmlToMarkdown(
        block.attributes.content
      ).split("\n");
      if (0 === block.innerBlocks.length) {
        let out = `${state.indent.join("")}${bullet} ${firstLine}`;
        state.indent.push(bulletIndent);
        if (restLines.length) {
          out += indent(restLines.join("\n"));
        }
        state.indent.pop();
        return out + "\n";
      }

      state.indent.push(bulletIndent);
      const innerContent = indent(
        `${restLines.join("\n")}\n${blocksToMarkdown(state, block.innerBlocks)}`
      );
      state.indent.pop();
      return `${state.indent.join(
        ""
      )}${bullet} ${firstLine}\n${innerContent}\n`;
    }

    case "core/paragraph":
      return htmlToMarkdown(block.attributes.content) + "\n\n";

    case "core/separator":
      return "\n---\n\n";

    default:
      console.log(block);
      return "";
  }
};

const blocksToMarkdown = (state: any, blocks: any[]): string => {
  return blocks.map((block: any) => blockToMarkdown(state, block)).join("");
};

export const blocks2markdown = (blocks: any[]): string => {
  const state = {
    indent: [] as string[],
    listStyle: [] as { style: string; count: number }[],
  };
  return blocksToMarkdown(state, blocks || []);
};
