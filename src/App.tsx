import { useState } from "react";
import Split from "react-split";
import { FileEdit, Github } from "lucide-react";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { convertToWordPressBlocks } from "./utils/converter";

const DEFAULT_MARKDOWN = `# Welcome to Markdown Editor
## Start typing to see the magic happen

This editor converts your markdown to WordPress Gutenberg blocks in real-time.

Some features you can try:
* Lists
* **Bold text**
* *Italic text*

> Blockquotes are supported too!

\`\`\`
// Code blocks work as well
function hello() {
  console.log("Hello, World!");
}
\`\`\``;

const URL_REPO =
  "https://github.com/wordpress-juanmaguitar/markdown-to-blocks-markup";
function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileEdit className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Markdown to WordPress Blocks
              </h1>
            </div>
            <div>
              <a
                href={URL_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              >
                <Github size={24} />{" "}
                <p>{URL_REPO.replace("https://github.com/", "")}</p>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Split
          sizes={[50, 50]}
          minSize={300}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          className="flex h-[calc(100vh-12rem)]"
        >
          <div className="h-full">
            <Editor value={markdown} onChange={setMarkdown} />
          </div>
          <div className="h-full">
            <Preview content={convertToWordPressBlocks(markdown)} />
          </div>
        </Split>
      </main>
    </div>
  );
}

export default App;
