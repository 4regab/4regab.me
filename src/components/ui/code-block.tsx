import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, className }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Clean and format the code
  const cleanCode = code.trim();

  return (
    <div className={cn("relative group rounded-lg border bg-neutral-950 dark:bg-neutral-900", className)}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/50 dark:bg-neutral-800/50 rounded-t-lg">
        <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
          {language || 'code'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
        {/* Code content */}
      <pre className="p-4 overflow-x-auto text-sm bg-neutral-950 dark:bg-neutral-900 rounded-b-lg">
        <code className="text-neutral-100 font-mono leading-relaxed block whitespace-pre">
          {cleanCode}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
