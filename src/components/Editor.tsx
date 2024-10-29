import React, { useRef } from "react";
import { FileDown } from "lucide-react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onChange(text);
      event.target.value = "";
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Markdown Input
          </h3>
          <p className="text-sm text-gray-600">
            Write or paste your markdown content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".md,.markdown,text/markdown"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
          >
            <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Import Markdown
          </button>
        </div>
      </div>
      <div className="relative group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[600px] px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-sm font-mono transition-all"
          placeholder="# Your Markdown Here

## Getting Started
1. Write or paste your markdown
2. See the live preview
3. Copy the generated blocks

```js
// Code blocks are supported
const hello = 'world';
```"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
      </div>
    </div>
  );
};
