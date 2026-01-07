'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import type { RepoContext, ChatMessage, ReadmeStyle } from '@/types';
import { generateId, copyToClipboard } from '@/lib/utils';
import { buildInitialMessage } from '@/lib/prompts';
import ChatInterface from '@/components/ChatInterface';
import ReadmePreview from '@/components/ReadmePreview';
import StyleSelector from '@/components/StyleSelector';

function ChatPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const repoUrl = searchParams.get('repo');

    const [repoContext, setRepoContext] = useState<RepoContext | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [style, setStyle] = useState<ReadmeStyle>('professional');
    const [currentReadme, setCurrentReadme] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');

    // Analyze the repository on mount
    useEffect(() => {
        if (!repoUrl) {
            router.push('/');
            return;
        }

        const analyzeRepo = async () => {
            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ repoUrl: decodeURIComponent(repoUrl) }),
                });

                const data = await response.json();

                if (!data.success) {
                    setError(data.error || 'Failed to analyze repository');
                    setIsAnalyzing(false);
                    return;
                }

                setRepoContext(data.data);

                // Add initial messages
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

                // Automatically generate README with the user message
                generateReadme(data.data, initialMessages, style);
            } catch (err) {
                console.error('Analysis error:', err);
                setError('Failed to connect to the server');
                setIsAnalyzing(false);
            }
        };

        analyzeRepo();
    }, [repoUrl, router]); // eslint-disable-line react-hooks/exhaustive-deps

    // Generate README function
    const generateReadme = useCallback(async (
        context: RepoContext,
        existingMessages: ChatMessage[],
        selectedStyle: ReadmeStyle
    ) => {
        setIsGenerating(true);
        setActiveTab('chat');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: existingMessages.filter(m => m.role === 'user'),
                    repoContext: context,
                    style: selectedStyle,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate README');
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

                // Update the assistant message with streaming content
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessage.id
                            ? { ...m, content: fullContent }
                            : m
                    )
                );

                // Extract README from markdown code blocks
                const readmeMatch = fullContent.match(/```markdown\n([\s\S]*?)```/);
                if (readmeMatch) {
                    setCurrentReadme(readmeMatch[1]);
                } else {
                    // Try without language specifier
                    const altMatch = fullContent.match(/```\n([\s\S]*?)```/);
                    if (altMatch) {
                        setCurrentReadme(altMatch[1]);
                    }
                }
            }

            setIsGenerating(false);
            setActiveTab('preview');
        } catch (err) {
            console.error('Generation error:', err);
            setError('Failed to generate README. Please try again.');
            setIsGenerating(false);
        }
    }, []);

    // Handle user message
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

        await generateReadme(repoContext, newMessages, style);
    };

    // Handle style change
    const handleStyleChange = (newStyle: ReadmeStyle) => {
        setStyle(newStyle);
        if (repoContext && messages.length > 0) {
            // Regenerate with new style
            generateReadme(repoContext, messages, newStyle);
        }
    };

    // Handle copy
    const handleCopy = async () => {
        if (!currentReadme) return;
        const success = await copyToClipboard(currentReadme);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Loading state
    if (isAnalyzing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <p className="text-muted-foreground">Analyzing repository...</p>
            </div>
        );
    }

    // Error state
    if (error && !repoContext) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-error">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-accent hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Try another repository
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <FileText className="w-5 h-5 text-accent" />
                        <span className="hidden sm:inline font-medium">README.wtf</span>
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium truncate max-w-[200px] sm:max-w-none">
                        {repoContext?.owner}/{repoContext?.repo}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        disabled={!currentReadme}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-success" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                Copy
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        New Repo
                    </button>
                </div>
            </header>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b border-border">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${activeTab === 'chat'
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-muted-foreground'
                        }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${activeTab === 'preview'
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-muted-foreground'
                        }`}
                >
                    Preview
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Chat Panel */}
                <div
                    className={`flex-1 flex flex-col border-r border-border ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'
                        }`}
                >
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isGenerating={isGenerating}
                    />
                    <div className="px-4 py-3 border-t border-border">
                        <StyleSelector value={style} onChange={handleStyleChange} disabled={isGenerating} />
                    </div>
                </div>

                {/* Preview Panel */}
                <div
                    className={`flex-1 flex flex-col ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'
                        }`}
                >
                    <ReadmePreview content={currentReadme} isLoading={isGenerating && !currentReadme} />
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}
