import React, { useState, useCallback } from 'react';
import Split from 'react-split';
import { FileEdit, Copy } from 'lucide-react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { convertToWordPressBlocks } from './utils/converter';

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

function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(convertToWordPressBlocks(markdown));
  }, [markdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileEdit className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">Markdown to WordPress Blocks</h1>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy WordPress Blocks
            </button>
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