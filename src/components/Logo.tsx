'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function Logo({ className, width = 120, height = 32 }: LogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder with same dimensions to avoid layout shift
        return <div style={{ width, height }} className={className} />;
    }

    const isDark = resolvedTheme === 'dark';
    const logoSrc = isDark ? '/rdark.png' : '/rlight.png';

    return (
        <div className={cn('relative', className)} style={{ width, height }}>
            <Image
                src={logoSrc}
                alt="Repokeet"
                fill
                className="object-contain object-left"
                priority
            />
        </div>
    );
}
