import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="markdown-content"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-2 border-b-2 border-blue-200"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold text-gray-900 mb-3 mt-5 pb-2 border-b border-blue-100"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-semibold text-gray-800 mb-2 mt-4"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-base font-semibold text-gray-800 mb-2 mt-3"
              {...props}
            />
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 ml-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700 leading-relaxed ml-2" {...props} />
          ),

          // Code blocks
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-mono border border-blue-200"
                {...props}
              />
            ) : (
              <code
                className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono mb-4 shadow-inner"
                {...props}
              />
            ),
          pre: ({ node, ...props }) => (
            <pre className="mb-4 overflow-hidden rounded-lg" {...props} />
          ),

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-400 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700 rounded-r"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              {...props}
            />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),

          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),

          // Horizontal Rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-blue-200" {...props} />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-blue-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          tr: ({ node, ...props }) => <tr {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 last:border-r-0"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
}
