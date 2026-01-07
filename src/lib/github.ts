import { Octokit } from 'octokit';
import type { RepoContext, FileContent } from '@/types';
import { estimateTokens } from './utils';

// Initialize Octokit (unauthenticated for public repos)
const octokit = new Octokit();

// Maximum tokens for context (leaving room for system prompt and response)
const MAX_CONTEXT_TOKENS = 50000;

// Priority files to fetch
const PRIORITY_FILES = [
    'package.json',
    'README.md',
    'tsconfig.json',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'requirements.txt',
    '.env.example',
    'docker-compose.yml',
    'docker-compose.yaml',
    'Dockerfile',
];

// Patterns for source files (will fetch first few matches)
const SOURCE_PATTERNS = [
    /^src\/index\.(ts|tsx|js|jsx)$/,
    /^src\/app\/.*page\.(ts|tsx)$/,
    /^src\/main\.(ts|tsx|js|jsx|py|rs|go)$/,
    /^lib\/.*\.(ts|tsx|js|jsx)$/,
    /^app\/.*\.(ts|tsx|js|jsx)$/,
];

// Files to ignore
const IGNORE_PATTERNS = [
    /node_modules/,
    /\.git/,
    /dist\//,
    /build\//,
    /\.next\//,
    /\.cache/,
    /coverage\//,
    /\.min\.(js|css)$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
];

/**
 * Fetch repository analysis from GitHub API
 */
export async function fetchRepoAnalysis(
    owner: string,
    repo: string
): Promise<RepoContext> {
    // Fetch repository tree
    const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo,
    });

    // Get the default branch
    const defaultBranch = repoData.default_branch;

    // Fetch the tree recursively
    const { data: treeData } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: 'true',
    });

    // Filter and sort file paths
    const allFiles = treeData.tree
        .filter((item) => item.type === 'blob' && item.path)
        .map((item) => item.path!)
        .filter((path) => !IGNORE_PATTERNS.some((pattern) => pattern.test(path)));

    // Track token usage
    let tokensUsed = 0;
    const keyFiles: FileContent[] = [];

    // Helper to fetch file content
    async function fetchFileContent(path: string): Promise<string | null> {
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                ref: defaultBranch,
            });

            if ('content' in data && data.content) {
                return Buffer.from(data.content, 'base64').toString('utf-8');
            }
        } catch (error) {
            console.error(`Failed to fetch ${path}:`, error);
        }
        return null;
    }

    // Fetch priority files first
    for (const filename of PRIORITY_FILES) {
        const matchingPath = allFiles.find(
            (path) => path === filename || path.endsWith(`/${filename}`)
        );

        if (matchingPath) {
            const content = await fetchFileContent(matchingPath);
            if (content) {
                const tokens = estimateTokens(content);
                if (tokensUsed + tokens <= MAX_CONTEXT_TOKENS) {
                    keyFiles.push({ path: matchingPath, content });
                    tokensUsed += tokens;
                }
            }
        }
    }

    // Fetch source files that match patterns
    for (const pattern of SOURCE_PATTERNS) {
        const matchingPaths = allFiles.filter((path) => pattern.test(path)).slice(0, 3);

        for (const path of matchingPaths) {
            if (keyFiles.some((f) => f.path === path)) continue;

            const content = await fetchFileContent(path);
            if (content) {
                const tokens = estimateTokens(content);
                if (tokensUsed + tokens <= MAX_CONTEXT_TOKENS) {
                    keyFiles.push({ path, content });
                    tokensUsed += tokens;
                }
            }
        }
    }

    // Extract package.json if present
    const packageJsonFile = keyFiles.find((f) => f.path.endsWith('package.json'));
    let packageJson: Record<string, unknown> | null = null;
    if (packageJsonFile) {
        try {
            packageJson = JSON.parse(packageJsonFile.content);
        } catch {
            // Invalid JSON, ignore
        }
    }

    // Extract existing README
    const readmeFile = keyFiles.find(
        (f) => f.path.toLowerCase() === 'readme.md'
    );
    const existingReadme = readmeFile?.content || null;

    return {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
        fileTree: allFiles.slice(0, 200), // Limit tree size
        packageJson,
        keyFiles: keyFiles.filter(
            (f) => !f.path.toLowerCase().endsWith('readme.md')
        ), // Exclude README from keyFiles
        existingReadme,
    };
}
