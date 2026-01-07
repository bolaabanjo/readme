'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Menu, PanelLeftOpen } from 'lucide-react';
import type { RepoContext, ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';
import { buildInitialMessage } from '@/lib/prompts';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';

function ChatPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const repoUrl = searchParams.get('repo');

    const [repoContext, setRepoContext] = useState<RepoContext | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [analysisInfo, setAnalysisInfo] = useState<{ owner: string; repo: string; fileCount?: number; keyFiles?: string[]; hasPackageJson?: boolean } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Analyze repo on mount
    useEffect(() => {
        if (!repoUrl) {
            router.push('/');
            return;
        }

        const analyzeRepo = async () => {
            try {
                // Parse owner/repo from URL to show progress immediately
                const decodedUrl = decodeURIComponent(repoUrl);
                const match = decodedUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                if (match) {
                    setAnalysisInfo({
                        owner: match[1],
                        repo: match[2].replace(/\.git$/, ''),
                    });
                }

                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ repoUrl: decodedUrl }),
                });

                const data = await response.json();

                if (!data.success) {
                    setError(data.error || 'Failed to analyze repository');
                    setIsAnalyzing(false);
                    return;
                }

                setRepoContext(data.data);

                // Update analysis info with results
                setAnalysisInfo({
                    owner: data.data.owner,
                    repo: data.data.repo,
                    fileCount: data.data.fileTree?.length || 0,
                    keyFiles: data.data.keyFiles?.map((f: { path: string }) => f.path) || [],
                    hasPackageJson: !!data.data.packageJson,
                });

                const initialMessage: ChatMessage = {
                    id: generateId(),
                    role: 'assistant',
                    content: buildInitialMessage(data.data),
                    timestamp: new Date(),
                };

                const userMessage: ChatMessage = {
                    id: generateId(),
                    role: 'user',
                    content: 'Generate a README for this repository.',
                    timestamp: new Date(),
                };

                const initialMessages = [initialMessage, userMessage];
                setMessages(initialMessages);
                setIsAnalyzing(false);

                // Send initial message to AI
                sendMessageToAI(data.data, initialMessages);
            } catch (err) {
                console.error('Analysis error:', err);
                setError('Failed to connect to the server');
                setIsAnalyzing(false);
            }
        };

        analyzeRepo();
    }, [repoUrl, router]); // eslint-disable-line react-hooks/exhaustive-deps

    const sendMessageToAI = useCallback(async (
        context: RepoContext,
        existingMessages: ChatMessage[]
    ) => {
        setIsGenerating(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: existingMessages.filter(m => m.role === 'user'),
                    repoContext: context,
                    style: 'professional',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let fullContent = '';

            const assistantMessage: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullContent += chunk;

                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessage.id
                            ? { ...m, content: fullContent }
                            : m
                    )
                );
            }

            setIsGenerating(false);
        } catch (err) {
            console.error('Chat error:', err);
            setError('Failed to get response. Please try again.');
            setIsGenerating(false);
        }
    }, []);

    const handleSendMessage = async (content: string) => {
        if (!repoContext || isGenerating) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        await sendMessageToAI(repoContext, newMessages);
    };

    if (error && !repoContext) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-error text-sm">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    ← Try another repository
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                currentRepoName={repoContext ? `${repoContext.owner}/${repoContext.repo}` : undefined}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex-shrink-0 w-full px-6 py-4 flex items-center">
                    <div className="flex items-center gap-3">
                        {/* Toggle button - visible on mobile, and on desktop when sidebar is closed */}
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
                                title="Open sidebar"
                            >
                                <PanelLeftOpen className="w-5 h-5" />
                            </button>
                        )}
                        {/* Legacy mobile menu toggle (only if for some reason we need it, but PanelLeftOpen is better) */}
                        {sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-1 -ml-1 text-muted-foreground hover:text-foreground md:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}
                        <span className="text-sm font-medium">
                            {repoContext?.owner}/{repoContext?.repo}
                        </span>
                    </div>
                </header>

                {/* Chat */}
                <div className="flex-1 flex flex-col min-h-0">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isGenerating={isGenerating}
                        isAnalyzing={isAnalyzing}
                        analysisInfo={analysisInfo || undefined}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}
