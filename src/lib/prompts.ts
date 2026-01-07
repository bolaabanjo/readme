import type { RepoContext, ReadmeStyle } from '@/types';

/**
 * Build the system prompt for README generation
 */
export function buildSystemPrompt(
    repoContext: RepoContext,
    style: ReadmeStyle
): string {
    const styleGuide = getStyleGuide(style);

    const fileTree = repoContext.fileTree.slice(0, 100).join('\n');
    const keyFilesContent = repoContext.keyFiles
        .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
        .join('\n\n');

    const packageJsonContent = repoContext.packageJson
        ? `### package.json\n\`\`\`json\n${JSON.stringify(repoContext.packageJson, null, 2)}\n\`\`\``
        : 'No package.json found';

    const existingReadmeSection = repoContext.existingReadme
        ? `### Existing README.md\n\`\`\`markdown\n${repoContext.existingReadme}\n\`\`\``
        : 'No existing README found';

    return `You are README.wtf, an AI assistant that generates high-quality README files by analyzing actual codebases.

## Your Mission
Analyze the provided repository data and generate a comprehensive, accurate README that reflects what the code actually does.

## Repository Information
- **URL**: ${repoContext.url}
- **Owner**: ${repoContext.owner}
- **Repo**: ${repoContext.repo}

## File Structure
\`\`\`
${fileTree}
\`\`\`

## Key Files
${packageJsonContent}

${keyFilesContent}

## Existing Documentation
${existingReadmeSection}

## Style Guidelines
${styleGuide}

## Rules
1. **Base everything on actual code** - Don't invent features that aren't in the codebase
2. **Be comprehensive** - Include Title, Description, Installation, Usage, Features, and any other relevant sections
3. **Add relevant badges** - Include badges for license, version, CI status if applicable
4. **Use proper markdown formatting** - Use headers, code blocks, lists, and tables appropriately
5. **Always output the full README** - Wrap the README in a \`\`\`markdown code block
6. **When asked to modify** - Output the complete updated README, not just changes
7. **Be conversational** - Before and after the README, add brief helpful comments

## Your Response
Start by briefly acknowledging what you found in the repository, then output the complete README in a markdown code block.`;
}

function getStyleGuide(style: ReadmeStyle): string {
    switch (style) {
        case 'professional':
            return `**Professional Style**
- Formal, enterprise-friendly tone
- Comprehensive documentation with all sections
- Clear structure with proper headings
- Technical accuracy is paramount
- Include examples and code snippets
- No emojis or casual language`;

        case 'casual':
            return `**Casual Style**
- Friendly, conversational tone
- Use emojis where appropriate 🚀
- Keep it fun but informative
- Use contractions and casual phrases
- Still technically accurate
- Make it welcoming for newcomers`;

        case 'minimal':
            return `**Minimal Style**
- Just the essentials, no fluff
- Brief descriptions
- Quick start focus
- Bullet points over paragraphs
- Skip optional sections
- Get to the point fast`;

        default:
            return '';
    }
}

/**
 * Build initial greeting message
 */
export function buildInitialMessage(repoContext: RepoContext): string {
    const { repo, packageJson, fileTree } = repoContext;

    const techStack: string[] = [];

    if (packageJson) {
        const deps = {
            ...(packageJson.dependencies as Record<string, string> || {}),
            ...(packageJson.devDependencies as Record<string, string> || {}),
        };

        if (deps.react) techStack.push('React');
        if (deps.next) techStack.push('Next.js');
        if (deps.vue) techStack.push('Vue');
        if (deps.angular) techStack.push('Angular');
        if (deps.express) techStack.push('Express');
        if (deps.typescript) techStack.push('TypeScript');
        if (deps.tailwindcss) techStack.push('Tailwind CSS');
    }

    // Detect by file extensions
    const hasRust = fileTree.some((f) => f.endsWith('.rs'));
    const hasPython = fileTree.some((f) => f.endsWith('.py'));
    const hasGo = fileTree.some((f) => f.endsWith('.go'));

    if (hasRust) techStack.push('Rust');
    if (hasPython) techStack.push('Python');
    if (hasGo) techStack.push('Go');

    const techStackText = techStack.length > 0
        ? `Built with: **${techStack.join(', ')}**`
        : 'Analyzing the tech stack...';

    return `I've analyzed the **${repo}** repository! 🔍

📁 Found **${fileTree.length}** files in the codebase
${techStackText}

Generating your README now...`;
}
