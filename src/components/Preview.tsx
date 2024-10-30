import React, { useState, useRef, useEffect } from "react";
import { Copy, Check, Code2, PlayCircle } from "lucide-react";

interface PreviewProps {
  content: string;
}

function convertToJsonString(content: string) {
  // Remove newlines and extra spaces for JSON compatibility
  const processedContent = content
    .trim()
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/'/g, "\\'") // Escape single quotes for JSON
    .replace(/"/g, '\\"'); // Escape double quotes

  // URL encode the processed content for inclusion in the URL
  return processedContent;
}

export const Preview: React.FC<PreviewProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviewInPlayground = () => {
    let markupBlocks = content;
    let postSlug = "preview-post-from-markdown";
    let postTitle = "Preview%20post%20from%20markdown";
    const h1Pattern =
      /<!-- wp:heading \{"level":1\} -->\s*<h1[^>]*>(.*?)<\/h1>\s*<!-- \/wp:heading -->/;

    const h1Match = content.match(h1Pattern);
    const h1ContentMatch = h1Match ? h1Match[1] : null;

    if (h1ContentMatch) {
      markupBlocks = markupBlocks.replace(h1Pattern, "");
      postTitle = h1ContentMatch;
      postSlug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    const postContent = convertToJsonString(markupBlocks);

    const blueprint = {
      landingPage: `/${postSlug}`,
      login: true,
      steps: [
        {
          step: "runPHP",
          code: `<?php require_once 'wordpress/wp-load.php'; wp_insert_post(array('post_title' => '${postTitle}', 'post_content' => '${postContent}', 'post_author'   => 1, 'post_status' => 'publish')); ?>`,
        },
      ],
    };
    // builder/builder.html
    const url = `https://playground.wordpress.net/#${JSON.stringify(
      blueprint
    )}`;
    console.log({ url });
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            WordPress Blocks (for the Block Editor)
          </h3>
          <p className="text-sm text-gray-600">Ready to use in WordPress</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePreviewInPlayground}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Preview in Playground</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl blur opacity-20"></div>
        <div className="relative">
          <div className="absolute top-0 right-0 p-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-gray-400" />
            <span
              className="text-xs text-gray-500 font-medium cursor-pointer"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Blocks"}
            </span>
          </div>
          <pre className="w-full h-[600px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl overflow-auto text-gray-800 font-mono text-sm scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {content || "Your converted blocks will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
};
