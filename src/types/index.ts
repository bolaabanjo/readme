// Types for README.wtf

export type ReadmeStyle = 'professional' | 'casual' | 'minimal';

export interface FileContent {
  path: string;
  content: string;
}

export interface RepoContext {
  owner: string;
  repo: string;
  url: string;
  fileTree: string[];
  packageJson: Record<string, unknown> | null;
  keyFiles: FileContent[];
  existingReadme: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnalyzeRequest {
  repoUrl: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: RepoContext;
  error?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  repoContext: RepoContext;
  style: ReadmeStyle;
}
