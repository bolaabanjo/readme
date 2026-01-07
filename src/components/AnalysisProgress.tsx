'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, FileText, Package, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisProgressProps {
    repoOwner: string;
    repoName: string;
    isComplete: boolean;
    fileCount?: number;
    keyFiles?: string[];
    hasPackageJson?: boolean;
}

export default function AnalysisProgress({
    repoOwner,
    repoName,
    isComplete,
    fileCount = 0,
    keyFiles = [],
    hasPackageJson = false,
}: AnalysisProgressProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Build the list of actions based on real data
    const actions = [
        {
            id: 'repo',
            icon: <GitBranch className="w-3.5 h-3.5" />,
            text: `Cloned ${repoOwner}/${repoName}`,
        },
        {
            id: 'tree',
            icon: <FolderOpen className="w-3.5 h-3.5" />,
            text: `Scanned ${fileCount} files`,
        },
    ];

    if (hasPackageJson) {
        actions.push({
            id: 'package',
            icon: <Package className="w-3.5 h-3.5" />,
            text: 'Read package.json',
        });
    }

    // Add key files that were read
    keyFiles.slice(0, 3).forEach((file) => {
        actions.push({
            id: file,
            icon: <FileText className="w-3.5 h-3.5" />,
            text: `Read ${file}`,
        });
    });

    const toolCount = actions.length;

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
                    {isComplete ? `${toolCount} steps completed` : 'Analyzing...'}
                </span>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-2 ml-5 space-y-1.5 animate-fade-in">
                    {actions.map((action, index) => (
                        <div
                            key={action.id}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <span className="text-muted-foreground/70">{action.icon}</span>
                            <span>{action.text}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
