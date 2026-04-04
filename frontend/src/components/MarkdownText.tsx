"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
  content: string;
}

export default function MarkdownText({ content }: MarkdownTextProps) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="text-sm leading-7 text-stone-600 [&:not(:first-child)]:mt-3">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="space-y-2 text-sm text-stone-600">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 leading-7">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="flex-1">{children}</span>
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-stone-900">{children}</strong>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
