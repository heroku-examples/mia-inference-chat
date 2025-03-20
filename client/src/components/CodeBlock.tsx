import type { ComponentPropsWithoutRef } from 'react';
import React, { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

export const CodeBlock: React.FC<ComponentPropsWithoutRef<'code'>> = props => {
  const { className, children, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const isInline = !match;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return isInline ? (
    <code
      className="bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 text-gray-800 dark:text-gray-200"
      {...rest}
    >
      {children}
    </code>
  ) : (
    <div className="relative group rounded-lg overflow-hidden">
      <div className="absolute right-2 top-2 z-10">
        <CopyToClipboard text={String(children)} onCopy={handleCopy}>
          <button
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title={isCopied ? 'Copied!' : 'Copy code'}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            )}
          </button>
        </CopyToClipboard>
      </div>
      <div className="!mt-0">
        <SyntaxHighlighter
          language={language || 'text'}
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            borderRadius: '0.5rem',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
