'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    isGenerating: boolean;
}

export default function ChatInterface({
    messages,
    onSendMessage,
    isGenerating,
}: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

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
        <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                'max-w-[85%] rounded-2xl px-4 py-3',
                                message.role === 'user'
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-muted text-foreground'
                            )}
                        >
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            {message.role === 'assistant' && isGenerating && message === messages[messages.length - 1] && (
                                <span className="cursor-blink" />
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                <div className="flex items-end gap-2 bg-muted rounded-xl p-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask to modify the README..."
                        disabled={isGenerating}
                        rows={1}
                        className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isGenerating}
                        className="flex-shrink-0 p-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-center">
                    Try: &ldquo;Make it more casual&rdquo; or &ldquo;Add a Features section&rdquo;
                </p>
            </form>
        </div>
    );
}
