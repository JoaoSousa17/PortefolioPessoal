import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface MarkdownContentProps {
  content: string
  className?: string
  /** Use 'blog' for full article styling, 'compact' for descriptions/cards */
  variant?: 'blog' | 'compact'
}

export function MarkdownContent({ content, className, variant = 'blog' }: MarkdownContentProps) {
  const isBlog = variant === 'blog'

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className={`font-bold text-slate-900 mt-10 mb-5 first:mt-0 ${isBlog ? 'text-3xl' : 'text-2xl'}`}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className={`font-bold text-slate-900 mt-8 mb-4 first:mt-0 ${isBlog ? 'text-2xl' : 'text-xl'}`}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className={`font-semibold text-slate-800 mt-6 mb-3 first:mt-0 ${isBlog ? 'text-xl' : 'text-lg'}`}
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold text-slate-800 mt-4 mb-2" {...props} />
          ),
          // Use a div instead of p when children contain a code block (<pre>)
          // to avoid the invalid HTML nesting <p><pre>...</pre></p>
          p: ({ node, children, ...props }) => {
            const hasBlockCode = node?.children?.some(
              (child: any) => child.type === 'element' && child.tagName === 'code'
                || child.type === 'element' && child.tagName === 'pre'
            )
            if (hasBlockCode) {
              return (
                <div
                  className={`text-slate-700 leading-relaxed text-justify mb-5 last:mb-0 ${isBlog ? 'text-lg' : 'text-base'}`}
                  {...(props as any)}
                >
                  {children}
                </div>
              )
            }
            return (
              <p
                className={`text-slate-700 leading-relaxed text-justify mb-5 last:mb-0 ${isBlog ? 'text-lg' : 'text-base'}`}
                {...props}
              >
                {children}
              </p>
            )
          },
          a: ({ node, ...props }) => (
            <a
              className="text-red-700 hover:text-red-800 hover:underline font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className={`list-disc list-outside pl-6 mb-5 space-y-1.5 text-slate-700 ${isBlog ? 'text-lg' : 'text-base'}`}
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className={`list-decimal list-outside pl-6 mb-5 space-y-1.5 text-slate-700 ${isBlog ? 'text-lg' : 'text-base'}`}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-red-700 pl-5 py-1 italic text-slate-600 my-6 bg-red-50/50 rounded-r-lg"
              {...props}
            />
          ),
          code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
            // Block code — rendered as pre>code
            if (!inline) {
              return (
                <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl overflow-x-auto mb-5 text-sm font-mono shadow-lg">
                  <code className={codeClassName} {...props}>
                    {children}
                  </code>
                </pre>
              )
            }
            // Inline code
            return (
              <code
                className="bg-slate-100 text-red-700 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200"
                {...props}
              >
                {children}
              </code>
            )
          },
          img: ({ node, ...props }) => (
            <img
              className="rounded-xl shadow-lg my-6 max-w-full h-auto mx-auto block"
              {...props}
            />
          ),
          hr: () => <hr className="my-8 border-slate-200" />,
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-slate-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-700" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-5 rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full border-collapse text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-100" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border-b border-slate-300 px-4 py-3 text-left font-semibold text-slate-900"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border-b border-slate-100 px-4 py-2.5 text-slate-700"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-slate-50 transition-colors" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
