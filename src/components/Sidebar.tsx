'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, User, LogIn, X, PanelLeftClose } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

interface ChatHistoryItem {
    id: string;
    repoName: string;
    timestamp: Date;
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    currentRepoName?: string;
}

export default function Sidebar({ isOpen, onToggle, currentRepoName }: SidebarProps) {
    const router = useRouter();
    // Placeholder auth state - will be replaced with real auth later
    const [isSignedIn] = useState(false);

    // Placeholder chat history - will be replaced with real data later
    const [chatHistory] = useState<ChatHistoryItem[]>([
        // Uncomment to test with placeholder data:
        // { id: '1', repoName: 'user/repo-one', timestamp: new Date() },
        // { id: '2', repoName: 'user/repo-two', timestamp: new Date(Date.now() - 86400000) },
    ]);

    const handleNewChat = () => {
        router.push('/');
        onToggle();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                'fixed md:relative inset-y-0 left-0 z-50 bg-background border-r border-white/10 flex flex-col transition-all duration-75',
                isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none'
            )}>
                {/* Logo & Toggle */}
                <div className="flex items-center justify-between px-5 py-5 min-w-[256px]">
                    <Logo width={100} height={28} />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onToggle}
                            className="p-1 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onToggle}
                            className="md:hidden p-1 -mr-1 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* New Chat Button */}
                <div className="px-3 pb-4">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New chat
                    </button>
                </div>

                {/* Current Chat */}
                {currentRepoName && (
                    <div className="px-3 pb-2">
                        <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-xl bg-white/5">
                            <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-sm">{currentRepoName}</span>
                        </div>
                    </div>
                )}

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-3">
                    {isSignedIn ? (
                        chatHistory.length > 0 ? (
                            <div className="space-y-1">
                                <span className="px-4 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                                    Recent
                                </span>
                                {chatHistory.map((chat) => (
                                    <button
                                        key={chat.id}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-colors text-left"
                                    >
                                        <MessageSquare className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                                        <span className="truncate text-muted-foreground">{chat.repoName}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-xs text-muted-foreground/60 text-center">
                                No chat history yet
                            </div>
                        )
                    ) : (
                        <div className="px-4 py-6 text-xs text-muted-foreground/60 text-center">
                            Sign in to save history
                        </div>
                    )}
                </div>

                {/* Auth Section */}
                <div className="p-3 flex items-center gap-2">
                    {isSignedIn ? (
                        <button className="flex-1 flex items-center gap-3 px-4 py-3 text-sm rounded-xl hover:bg-white/5 transition-colors overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="truncate text-sm">user@example.com</span>
                        </button>
                    ) : (
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10">
                            <LogIn className="w-4 h-4" />
                            Sign in
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </aside>
        </>
    );
}
