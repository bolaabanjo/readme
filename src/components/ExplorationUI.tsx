'use client';

import { Star, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplorationUIProps {
    owner: string;
    repo: string;
    onSelectPrompt: (prompt: string) => void;
    onSwitchRepo: () => void;
}

const SUGGESTED_PROMPTS = [
    'What is the project structure?',
    'How does the main entry point work?',
    'What are the key abstractions?',
    'Show me the testing patterns',
    'Generate a README for this project',
    'Explain the architecture',
];

export default function ExplorationUI({
    owner,
    repo,
    onSelectPrompt,
    onSwitchRepo,
}: ExplorationUIProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-xl w-full text-center space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                        Let&apos;s explore
                    </h1>

                    {/* Repo Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                            {owner.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">
                            <span className="text-muted-foreground">{owner}/</span>
                            <span className="font-medium">{repo}</span>
                        </span>
                        <Star className="w-3.5 h-3.5 text-muted-foreground" />
                        <Circle className="w-2 h-2 fill-current text-muted-foreground" />
                    </div>
                </div>

                {/* Suggested Prompts */}
                <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => onSelectPrompt(prompt)}
                            className={cn(
                                "px-4 py-2.5 text-sm rounded-xl border border-border/50 bg-background",
                                "hover:bg-muted/50 hover:border-border transition-colors",
                                "text-foreground/80 hover:text-foreground"
                            )}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center">
                    <div className="w-8 h-px bg-border/50" />
                </div>

                {/* Switch Repo Link */}
                <button
                    onClick={onSwitchRepo}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Switch to a different repository →
                </button>
            </div>
        </div>
    );
}
