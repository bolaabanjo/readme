'use client';

import type { ReadmeStyle } from '@/types';
import { cn } from '@/lib/utils';

interface StyleSelectorProps {
    value: ReadmeStyle;
    onChange: (style: ReadmeStyle) => void;
    disabled?: boolean;
}

const styles: { value: ReadmeStyle; label: string; emoji: string; description: string }[] = [
    {
        value: 'professional',
        label: 'Professional',
        emoji: '💼',
        description: 'Formal, comprehensive',
    },
    {
        value: 'casual',
        label: 'Casual',
        emoji: '🚀',
        description: 'Friendly, emoji-filled',
    },
    {
        value: 'minimal',
        label: 'Minimal',
        emoji: '⚡',
        description: 'Just the essentials',
    },
];

export default function StyleSelector({
    value,
    onChange,
    disabled,
}: StyleSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Style:</span>
            <div className="flex gap-1">
                {styles.map((style) => (
                    <button
                        key={style.value}
                        onClick={() => onChange(style.value)}
                        disabled={disabled}
                        title={style.description}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                            value === style.value
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {style.emoji} {style.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
