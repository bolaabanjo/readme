# Repokeet

AI-powered README generator. Paste a GitHub URL, get documentation that doesn't suck.

## Features

- **Instant Analysis**: Paste any public GitHub repo URL
- **AI-Powered Generation**: Uses AI to understand your codebase and generate accurate documentation
- **Chat Interface**: Iterate on your README through conversation
- **Dark/Light Mode**: Beautiful theming with system preference support
- **Chat History**: Sign in with GitHub to save and access previous sessions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **AI**: Cencori SDK
- **Database & Auth**: Supabase
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub API token (optional, for higher rate limits)
- Supabase project (for auth & persistence)
- Cencori API key

### Installation

```bash
# Clone the repository
git clone https://github.com/bolaabanjo/repokeet.git
cd repokeet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

```bash
GITHUB_TOKEN=your_github_token
CENCORI_API_KEY=your_cencori_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT

---

Built on [Cencori](https://cencori.com)
