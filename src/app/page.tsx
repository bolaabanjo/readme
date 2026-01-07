'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import { isValidGitHubUrl } from '@/lib/utils';
import { Logo } from '@/components/Logo';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Enter a GitHub repository URL');
      return;
    }

    if (!isValidGitHubUrl(repoUrl.trim())) {
      setError('Enter a valid GitHub URL');
      return;
    }

    setIsLoading(true);
    const encodedUrl = encodeURIComponent(repoUrl.trim());
    router.push(`/chat?repo=${encodedUrl}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Logo width={120} height={32} />
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 h-8 px-3 text-xs rounded-full border border-border/50 hover:border-border transition-colors group"
        >
          <div className="relative w-3.5 h-3.5 dark:invert">
            <Image
              src="/github-mark.png"
              alt="GitHub"
              fill
              className="object-contain"
            />
          </div>
          Sign in
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Chat with any codebase.
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste a GitHub URL. AI analyzes your code and answers any question.
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 p-1.5 pl-5 shadow-inner transition-colors focus-within:border-border/80 focus-within:bg-muted/50">
              <div className="relative w-5 h-5 flex-shrink-0 opacity-50 dark:invert">
                <Image
                  src="/github-mark.png"
                  alt="GitHub"
                  fill
                  className="object-contain"
                />
              </div>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError('');
                }}
                placeholder="Enter a valid GitHub URL"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-foreground text-background rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-error text-xs animate-fade-in">{error}</p>
            )}
          </form>

          {/* Examples */}
          <div className="text-xs text-muted-foreground">
            Try:{' '}
            <button
              onClick={() => setRepoUrl('https://github.com/shadcn-ui/ui')}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              shadcn/ui
            </button>
            {' · '}
            <button
              onClick={() => setRepoUrl('https://github.com/vercel/next.js')}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              vercel/next.js
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Repokeet</span>
          <span>
            Free · <a href="https://github.com/bolaabanjo/repokeet" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">GitHub</a> · Built on <a href="https://cencori.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Cencori</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
