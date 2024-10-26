import React from 'react';
import { FileEdit } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-200">
        <FileEdit className="h-4 w-4 text-gray-500" />
        <h2 className="text-sm font-medium text-gray-700">Markdown Editor</h2>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[calc(100%-3rem)] p-4 font-mono text-sm text-gray-800 resize-none focus:outline-none"
        placeholder="Type your markdown here..."
      />
    </div>
  );
}