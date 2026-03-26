"use client";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ children, className: codeClassName }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isInline = !match && !String(children).includes("\n");
            
            if (isInline) {
              return (
                <code className="bg-white/10 text-primary-fixed border border-white/5 rounded px-1.5 py-0.5 text-[0.85rem] font-mono tracking-tight">
                  {children}
                </code>
              );
            }
            
            return (
              <div className="relative my-4 group">
                {match && (
                  <div className="absolute top-0 right-0 bg-white/10 text-[0.65rem] font-bold tracking-widest uppercase text-white/50 px-3 py-1 rounded-bl-xl rounded-tr-xl backdrop-blur-md border-b border-l border-white/5 z-10">
                    {match[1]}
                  </div>
                )}
                <pre className="p-4 pt-8 bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-x-auto font-mono text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] text-gray-300">
                  <code className={codeClassName}>{String(children).replace(/\n$/, "")}</code>
                </pre>
              </div>
            );
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-5 mb-3 font-headline tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-4 mb-2 font-headline tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-white/90 mt-3 mb-2 font-headline">{children}</h3>,
          p: ({ children }) => <p className="text-on-surface-variant/90 leading-relaxed mb-3 text-sm">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside text-on-surface-variant/90 mb-3 space-y-1 ml-2 marker:text-primary/70">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-on-surface-variant/90 mb-3 space-y-1 ml-2 marker:text-primary/70">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 bg-primary/5 pl-4 py-2 pr-2 italic text-on-surface-variant/80 my-3 rounded-r-lg text-sm">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => <a href={href} className="text-secondary hover:text-secondary-fixed underline underline-offset-4 decoration-secondary/30 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
          table: ({ children }) => <div className="overflow-x-auto border border-white/10 rounded-lg my-4"><table className="w-full text-left border-collapse text-sm text-on-surface-variant/90">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-white/10 px-4 py-3 bg-white/5 font-bold text-white uppercase tracking-wider text-[0.7rem]">{children}</th>,
          td: ({ children }) => <td className="border-b border-white/5 px-4 py-3">{children}</td>,
          strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
          em: ({ children }) => <em className="italic text-on-surface-variant">{children}</em>,
          hr: () => <hr className="border-white/10 my-6 shadow-[0_0_10px_rgba(255,92,0,0.1)]" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});