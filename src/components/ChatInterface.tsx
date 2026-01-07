'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import AnalysisProgress from './AnalysisProgress';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    isGenerating: boolean;
    isAnalyzing?: boolean;
    analysisInfo?: {
        owner: string;
        repo: string;
        fileCount?: number;
        keyFiles?: string[];
        hasPackageJson?: boolean;
    };
}

export default function ChatInterface({
    messages,
    onSendMessage,
    isGenerating,
    isAnalyzing = false,
    analysisInfo,
}: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAnalyzing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isGenerating) return;
        onSendMessage(input.trim());
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
                    {/* Analysis progress */}
                    {analysisInfo && (
                        <AnalysisProgress
                            repoOwner={analysisInfo.owner}
                            repoName={analysisInfo.repo}
                            isComplete={!isAnalyzing}
                            fileCount={analysisInfo.fileCount}
                            keyFiles={analysisInfo.keyFiles}
                            hasPackageJson={analysisInfo.hasPackageJson}
                        />
                    )}

                    {/* Messages */}
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'animate-fade-in',
                                message.role === 'user' ? 'flex justify-end' : ''
                            )}
                        >
                            {message.role === 'user' ? (
                                <div className="inline-block px-4 py-2.5 text-sm rounded-2xl bg-muted border border-border">
                                    {message.content}
                                </div>
                            ) : (
                                <div className="text-sm text-foreground leading-relaxed">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ children }) => <h1 className="text-base font-semibold mb-4 mt-6 first:mt-0">{children}</h1>,
                                            h2: ({ children }) => <h2 className="text-sm font-semibold mt-6 mb-3">{children}</h2>,
                                            h3: ({ children }) => <h3 className="text-sm font-medium mt-4 mb-2">{children}</h3>,
                                            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                                            ul: ({ children }) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1.5">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1.5">{children}</ol>,
                                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                            code: ({ className, children }) => {
                                                const isInline = !className;
                                                return isInline ? (
                                                    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">{children}</code>
                                                ) : (
                                                    <code className={cn("block p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-x-auto border border-border/50", className)}>{children}</code>
                                                );
                                            },
                                            pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                    {isGenerating && message === messages[messages.length - 1] && (
                                        <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse ml-0.5" />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 px-6 pb-6 pt-4">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-3 rounded-full border border-border bg-muted/30 px-5 py-2 focus-within:bg-muted/50 transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about the codebase..."
                                disabled={isGenerating || isAnalyzing}
                                className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isGenerating || isAnalyzing}
                                className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-foreground text-background rounded-full hover:opacity-90 transition-opacity disabled:opacity-30"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
