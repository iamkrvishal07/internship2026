import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import "highlight.js/styles/github-dark.css";

type MarkdownRendererProps = {
  content: string;
  isOwn?: boolean;
  style?: React.CSSProperties;
};

const MarkdownRenderer = ({
  content,
  isOwn = false,
  style,
}: MarkdownRendererProps) => {
  return (
    <div
      className={`
        prose prose-sm max-w-none wrap-break-words
        prose-p:my-1
        prose-pre:rounded-xl
        prose-pre:p-3
        prose-code:before:hidden
        prose-code:after:hidden
        ${isOwn ? "prose-invert" : ""}
      `}
      style={style}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;