'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import type { RepoContext, ChatMessage, ReadmeStyle } from '@/types';
import { generateId, copyToClipboard } from '@/lib/utils';
import { buildInitialMessage } from '@/lib/prompts';
import ChatInterface from '@/components/ChatInterface';
import ReadmePreview from '@/components/ReadmePreview';

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
    const [analysisInfo, setAnalysisInfo] = useState<{ owner: string; repo: string; fileCount?: number; keyFiles?: string[]; hasPackageJson?: boolean } | null>(null);

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

                generateReadme(data.data, initialMessages, style);
            } catch (err) {
                console.error('Analysis error:', err);
                setError('Failed to connect to the server');
                setIsAnalyzing(false);
            }
        };

        analyzeRepo();
    }, [repoUrl, router]); // eslint-disable-line react-hooks/exhaustive-deps

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

                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessage.id
                            ? { ...m, content: fullContent }
                            : m
                    )
                );

                const readmeMatch = fullContent.match(/```markdown\n([\s\S]*?)```/);
                if (readmeMatch) {
                    setCurrentReadme(readmeMatch[1]);
                } else {
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

    const handleStyleChange = (newStyle: ReadmeStyle) => {
        setStyle(newStyle);
        if (repoContext && messages.length > 0) {
            generateReadme(repoContext, messages, newStyle);
        }
    };

    const handleCopy = async () => {
        if (!currentReadme) return;
        const success = await copyToClipboard(currentReadme);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };



    if (error && !repoContext) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-error text-sm">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Try another repository
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-border/50 sticky top-0 z-50 bg-background">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">README.wtf</span>
                    </button>
                    <span className="text-border">/</span>
                    <span className="text-sm font-medium truncate max-w-[180px] sm:max-w-none">
                        {repoContext?.owner}/{repoContext?.repo}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        disabled={!currentReadme}
                        className="flex items-center gap-1.5 h-8 px-3 text-xs rounded-full border border-border/50 hover:border-border transition-colors disabled:opacity-50"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3 text-success" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                Copy
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="h-8 px-3 text-xs font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                    >
                        New
                    </button>
                </div>
            </header>

            {/* Mobile Tabs - Sticky below header */}
            <div className="md:hidden flex border-b border-border/50 sticky top-[52px] z-40 bg-background">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === 'chat'
                        ? 'text-foreground border-b border-foreground'
                        : 'text-muted-foreground'
                        }`}
                >
                    Chat
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === 'preview'
                        ? 'text-foreground border-b border-foreground'
                        : 'text-muted-foreground'
                        }`}
                >
                    Preview
                </button>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Chat */}
                <div className={`flex-1 flex flex-col min-h-0 border-r border-border/50 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isGenerating={isGenerating}
                        isAnalyzing={isAnalyzing}
                        analysisInfo={analysisInfo || undefined}
                    />
                </div>

                {/* Preview */}
                <div className={`flex-1 flex flex-col ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
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
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}
