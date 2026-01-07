'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Zap, MessageSquare, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { isValidGitHubUrl } from '@/lib/utils';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!isValidGitHubUrl(repoUrl.trim())) {
      setError('Please enter a valid GitHub URL (e.g., https://github.com/owner/repo)');
      return;
    }

    setIsLoading(true);

    // Encode the URL and navigate to chat page
    const encodedUrl = encodeURIComponent(repoUrl.trim());
    router.push(`/chat?repo=${encodedUrl}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent" />
          <span className="text-lg font-semibold">README.wtf</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
        >
          <Github className="w-4 h-4" />
          Sign in
        </a>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Generate a README that{' '}
              <span className="gradient-text">doesn&apos;t suck</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Paste a GitHub URL. Our AI actually reads your code and creates
              documentation that reflects what your project does.
            </p>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="gradient-border glow">
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-muted rounded-xl">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-background rounded-lg">
                  <Github className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      setError('');
                    }}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Generate README
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-error text-sm animate-fade-in">{error}</p>
            )}
          </form>

          {/* Quick Example */}
          <div className="text-sm text-muted-foreground">
            Try it with{' '}
            <button
              onClick={() => setRepoUrl('https://github.com/shadcn-ui/ui')}
              className="text-accent hover:underline"
            >
              shadcn/ui
            </button>
            {' or '}
            <button
              onClick={() => setRepoUrl('https://github.com/vercel/next.js')}
              className="text-accent hover:underline"
            >
              vercel/next.js
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="w-full px-6 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Reads Your Code</h3>
            <p className="text-muted-foreground text-sm">
              Fetches your repo via GitHub API. Analyzes package.json, source files,
              and project structure.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">AI-Powered</h3>
            <p className="text-muted-foreground text-sm">
              Powered by Gemini 2.0 Flash with 1M context window.
              Understands your entire codebase.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">Conversational</h3>
            <p className="text-muted-foreground text-sm">
              Refine your README through natural language.
              &ldquo;Make it more casual&rdquo; or &ldquo;add API docs&rdquo;.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>README.wtf</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Built on Cencori infrastructure</span>
            <span>•</span>
            <span>100% Free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
