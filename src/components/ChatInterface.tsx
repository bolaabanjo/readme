'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
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
            {/* Scrollable Messages Area - takes remaining space */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4 min-h-0">
                {/* Show analysis progress - persists after completion */}
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

                {/* Show messages */}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            'flex animate-fade-in',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[85%] px-4 py-2 text-sm rounded-2xl',
                                message.role === 'user'
                                    ? 'bg-white text-black shadow-sm'
                                    : 'bg-white/5 text-foreground border border-white/10'
                            )}
                        >
                            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                            {message.role === 'assistant' && isGenerating && message === messages[messages.length - 1] && (
                                <span className="cursor-blink ml-1" />
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Input at Bottom - never shrinks */}
            <div className="flex-shrink-0 p-4 bg-background border-t border-border/50">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 pl-6 pr-2 shadow-lg backdrop-blur-sm">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about the codebase..."
                            disabled={isGenerating || isAnalyzing}
                            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 h-[44px]"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isGenerating || isAnalyzing}
                            className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-white text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
