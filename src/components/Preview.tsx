import React from 'react';
import { Code2 } from 'lucide-react';

interface PreviewProps {
  content: string;
}

export function Preview({ content }: PreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-200">
        <Code2 className="h-4 w-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-700">WordPress Blocks Preview</h2>
      </div>
      <pre className="w-full h-[calc(100%-3rem)] p-4 font-mono text-sm text-gray-600 overflow-auto">
        {content}
      </pre>
    </div>
  );
}