import { Cencori } from 'cencori';

// Initialize Cencori SDK client
export const cencori = new Cencori({
    apiKey: process.env.CENCORI_API_KEY!,
});

// Model to use for README generation
export const AI_MODEL = 'gemini-2.5-flash';
