'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import { isValidGitHubUrl } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isSignedIn, signInWithGitHub, signOut, loading } = useAuth();

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

        {loading ? (
          <div className="h-10 w-28 rounded-full bg-muted/50 animate-pulse" />
        ) : isSignedIn && user ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 h-10 pl-1.5 pr-4 rounded-full border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
          >
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-sm">
              {user.user_metadata?.full_name || user.user_metadata?.user_name || user.email?.split('@')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={() => signInWithGitHub()}
            className="flex items-center gap-2 h-10 px-4 text-sm rounded-full border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
          >
            <div className="relative w-4 h-4 dark:invert">
              <Image
                src="/github-mark.png"
                alt="GitHub"
                fill
                className="object-contain"
              />
            </div>
            Sign in
          </button>
        )}
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
