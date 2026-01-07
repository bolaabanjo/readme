'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Brain, Sparkles, FileSearch, Code, Lightbulb, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingProgressProps {
    userPrompt: string;
    isComplete?: boolean;
}

// Generate thinking steps based on user prompt
function getThinkingSteps(prompt: string): { id: string; icon: React.ReactNode; text: string }[] {
    const lowerPrompt = prompt.toLowerCase();

    const baseSteps = [
        {
            id: 'understanding',
            icon: <Brain className="w-3.5 h-3.5" />,
            text: 'Understanding your request...',
        },
    ];

    // Add context-aware steps based on the prompt
    if (lowerPrompt.includes('readme') || lowerPrompt.includes('documentation')) {
        baseSteps.push(
            { id: 'scan', icon: <FileSearch className="w-3.5 h-3.5" />, text: 'Scanning project structure...' },
            { id: 'analyze', icon: <Code className="w-3.5 h-3.5" />, text: 'Analyzing key files...' },
            { id: 'identify', icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Identifying main features...' },
            { id: 'write', icon: <PenTool className="w-3.5 h-3.5" />, text: 'Writing documentation...' },
        );
    } else if (lowerPrompt.includes('structure') || lowerPrompt.includes('architecture')) {
        baseSteps.push(
            { id: 'scan', icon: <FileSearch className="w-3.5 h-3.5" />, text: 'Mapping directory structure...' },
            { id: 'analyze', icon: <Code className="w-3.5 h-3.5" />, text: 'Identifying patterns...' },
            { id: 'organize', icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Organizing findings...' },
        );
    } else if (lowerPrompt.includes('test') || lowerPrompt.includes('testing')) {
        baseSteps.push(
            { id: 'scan', icon: <FileSearch className="w-3.5 h-3.5" />, text: 'Looking for test files...' },
            { id: 'analyze', icon: <Code className="w-3.5 h-3.5" />, text: 'Analyzing test patterns...' },
            { id: 'identify', icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Identifying test strategies...' },
        );
    } else if (lowerPrompt.includes('entry') || lowerPrompt.includes('main')) {
        baseSteps.push(
            { id: 'scan', icon: <FileSearch className="w-3.5 h-3.5" />, text: 'Finding entry points...' },
            { id: 'analyze', icon: <Code className="w-3.5 h-3.5" />, text: 'Tracing execution flow...' },
            { id: 'identify', icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Mapping dependencies...' },
        );
    } else if (lowerPrompt.includes('abstraction') || lowerPrompt.includes('pattern')) {
        baseSteps.push(
            { id: 'scan', icon: <FileSearch className="w-3.5 h-3.5" />, text: 'Scanning codebase...' },
            { id: 'analyze', icon: <Code className="w-3.5 h-3.5" />, text: 'Identifying abstractions...' },
            { id: 'identify', icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Finding design patterns...' },
        );
    } else {
        // Generic steps for other prompts
        baseSteps.push(
            { id: 'scan', icon: <FileSearch className="w-3.5 h-3.5" />, text: 'Reading the codebase...' },
            { id: 'analyze', icon: <Code className="w-3.5 h-3.5" />, text: 'Analyzing relevant files...' },
            { id: 'thinking', icon: <Lightbulb className="w-3.5 h-3.5" />, text: 'Formulating response...' },
        );
    }

    baseSteps.push({
        id: 'generate',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        text: 'Generating response...',
    });

    return baseSteps;
}

export default function ThinkingProgress({ userPrompt, isComplete = false }: ThinkingProgressProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const steps = getThinkingSteps(userPrompt);

    // Animate through steps
    useEffect(() => {
        if (isComplete) {
            setCurrentStep(steps.length);
            return;
        }

        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [isComplete, steps.length]);

    const completedSteps = isComplete ? steps.length : currentStep + 1;

    return (
        <div className="animate-fade-in">
            {/* Collapsible Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
                <span className={cn(
                    'transition-transform duration-200',
                    isExpanded && 'rotate-90'
                )}>
                    <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono">
                    {isComplete
                        ? `${steps.length} steps completed`
                        : (
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground/50 animate-pulse" />
                                {steps[currentStep]?.text || 'Thinking...'}
                            </span>
                        )
                    }
                </span>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-2 ml-5 space-y-1.5 animate-fade-in">
                    {steps.slice(0, completedSteps).map((step, index) => (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-2 text-xs",
                                index < completedSteps - 1 || isComplete
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <span className="text-muted-foreground/70">{step.icon}</span>
                            <span>{step.text}</span>
                            {index === completedSteps - 1 && !isComplete && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground/50 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
