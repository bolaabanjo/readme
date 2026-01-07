'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2 } from 'lucide-react';

interface ReadmePreviewProps {
    content: string;
    isLoading: boolean;
}

export default function ReadmePreview({ content, isLoading }: ReadmePreviewProps) {
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Generating README...</p>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <p className="text-xs text-muted-foreground">
                    README preview will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match;

                            if (isInline) {
                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }

                            return (
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
