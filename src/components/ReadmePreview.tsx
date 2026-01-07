'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileText, Loader2 } from 'lucide-react';

interface ReadmePreviewProps {
    content: string;
    isLoading: boolean;
}

export default function ReadmePreview({ content, isLoading }: ReadmePreviewProps) {
    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-muted-foreground">Generating your README...</p>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">README Preview</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Your generated README will appear here. Start a conversation to create one.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto markdown-content">
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
                                        fontSize: '0.875rem',
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
