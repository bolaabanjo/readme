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

    return `You are Repokeet, an AI assistant that helps developers understand and explore codebases.

## Your Mission
Analyze the provided repository data and help the user with any questions they have about the codebase. You can:
- Explain the project structure and architecture
- Describe how specific features work
- Generate comprehensive README files
- Identify key abstractions and patterns
- Answer questions about the code
- Suggest improvements or best practices

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

## Style Guidelines (for README generation)
${styleGuide}

## Rules
1. **Base everything on actual code** - Don't invent features that aren't in the codebase
2. **Be helpful and conversational** - Engage naturally with the user's questions
3. **Use proper formatting** - Use markdown headers, code blocks, lists, and tables appropriately
4. **For README requests** - Wrap the README in a \`\`\`markdown code block and output the complete file
5. **Be concise but thorough** - Answer questions directly but provide context when helpful
6. **Reference specific files** - When explaining code, mention the relevant file paths

## Your Response
Respond naturally to the user's question. If they ask for a README, generate a complete one. For other questions, provide clear, helpful explanations based on the actual code.`;
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
