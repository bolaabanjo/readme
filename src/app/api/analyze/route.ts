import { NextResponse } from 'next/server';
import { fetchRepoAnalysis } from '@/lib/github';
import { parseGitHubUrl } from '@/lib/utils';
import type { AnalyzeRequest, AnalyzeResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const body: AnalyzeRequest = await request.json();
        const { repoUrl } = body;

        if (!repoUrl) {
            return NextResponse.json<AnalyzeResponse>(
                { success: false, error: 'Repository URL is required' },
                { status: 400 }
            );
        }

        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
            return NextResponse.json<AnalyzeResponse>(
                { success: false, error: 'Invalid GitHub URL format' },
                { status: 400 }
            );
        }

        const { owner, repo } = parsed;

        const repoContext = await fetchRepoAnalysis(owner, repo);

        return NextResponse.json<AnalyzeResponse>({
            success: true,
            data: repoContext,
        });
    } catch (error) {
        console.error('Analyze error:', error);

        const message = error instanceof Error ? error.message : 'Failed to analyze repository';

        // Handle GitHub API errors
        if (message.includes('Not Found')) {
            return NextResponse.json<AnalyzeResponse>(
                { success: false, error: 'Repository not found. Make sure it exists and is public.' },
                { status: 404 }
            );
        }

        return NextResponse.json<AnalyzeResponse>(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
