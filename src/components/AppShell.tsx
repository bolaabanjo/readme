'use client';

import { useState, Suspense } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
    children: React.ReactNode;
}

function SidebarWrapper({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
    return (
        <Sidebar
            isOpen={isOpen}
            onToggle={onToggle}
            currentRepoName={undefined}
        />
    );
}

export default function AppShell({ children }: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Global Sidebar - starts collapsed */}
            <Suspense fallback={null}>
                <SidebarWrapper
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
            </Suspense>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}
