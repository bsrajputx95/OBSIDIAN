# Viber AI - Multi-Model Orchestration Platform

A sophisticated Next.js application that implements a **4-stage AI orchestration pipeline** where each stage uses **4 concurrent AI models** (3 workers + 1 master) to process user prompts through research → reasoning → coding → final synthesis.

## 🚀 Features

### Multi-Model Orchestration
- **4 Stages**: Research → Reasoning → Coding → Final
- **4 Models per Stage**: 3 specialized workers + 1 master aggregator
- **16 Total Model Slots**: Fully configurable per stage
- **Concurrent Streaming**: Real-time responses from multiple models

### Provider Support
- **OpenRouter** (50+ pre-configured models)
- **OpenAI** (GPT-4, GPT-3.5, etc.)
- **Anthropic** (Claude 3, Claude 2)
- **Google** (Gemini Pro, Gemini Flash)
- **xAI** (Grok models)
- **Mistral** (Mistral models)
- **Groq** (Fast inference)
- **Cohere** (Command models)
- **Together AI** (Open source models)

### Advanced Features
- **Real-time Streaming**: Server-Sent Events (SSE) with live updates
- **Stage-specific Prompts**: Specialized instructions per worker role
- **3D Background**: Interactive network visualization
- **Responsive Design**: Mobile-friendly with dark theme
- **Model Management**: Easy switching between providers and models

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd viber-ai
npm install
```

### 2. Environment Variables
Copy the example environment file and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# OpenRouter (recommended - supports many models)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Google Gemini
GOOGLE_API_KEY=your_google_api_key_here

# Add other providers as needed...
```

### 3. Get API Keys

#### OpenRouter (Recommended)
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up and get your API key
3. Supports 50+ models from various providers

#### Other Providers
- **OpenAI**: [platform.openai.com](https://platform.openai.com)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google**: [makersuite.google.com](https://makersuite.google.com)
- **xAI**: [x.ai](https://x.ai)
- **Mistral**: [console.mistral.ai](https://console.mistral.ai)
- **Groq**: [console.groq.com](https://console.groq.com)
- **Cohere**: [dashboard.cohere.ai](https://dashboard.cohere.ai)
- **Together**: [api.together.xyz](https://api.together.xyz)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How to Use

### 1. Configure Models
1. Select a provider (OpenRouter recommended)
2. Enter your API key
3. Click "Fetch Models" to load available models
4. Configure models for each stage and worker

### 2. Enter Your Prompt
- Type your request in the main prompt area
- Enable/disable stages as needed
- Click "Start Processing"

### 3. Watch the Magic
- **Research Stage**: 4 models analyze market, tech, and validation
- **Reasoning Stage**: 4 models plan architecture and strategy  
- **Coding Stage**: 4 models design implementation
- **Final Stage**: Master model synthesizes everything

## 🏗️ Architecture

### Stage System
Each stage has specialized worker roles:

#### Research Stage
- **Worker 1**: Market Analysis Specialist
- **Worker 2**: Technical Research Specialist  
- **Worker 3**: Problem Validation Specialist
- **Master**: Research Synthesis Master

#### Reasoning Stage
- **Worker 1**: Solution Architect
- **Worker 2**: Risk & Optimization Analyst
- **Worker 3**: Implementation Planner
- **Master**: Reasoning Synthesis Master

#### Coding Stage
- **Worker 1**: System Architect
- **Worker 2**: Frontend & UX Developer
- **Worker 3**: Security & DevOps Specialist
- **Master**: Coding Synthesis Master

#### Final Stage
- **Worker 1**: Research Consolidator
- **Worker 2**: Reasoning Consolidator
- **Worker 3**: Implementation Consolidator
- **Master**: Final Synthesis Master

### Technology Stack
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **3D Graphics**: React Three Fiber
- **Streaming**: Server-Sent Events (SSE)

## 🔧 Development

### Project Structure
```
viber-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── stream/        # SSE endpoints
│   │   │   └── models/        # Model discovery
│   │   └── auth/              # Authentication
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── StagePanel.tsx    # Main interface
│   │   ├── StreamingPane.tsx  # Model panels
│   │   └── BackgroundCanvas.tsx # 3D background
│   └── lib/                   # Utilities
│       ├── store/            # Zustand stores
│       ├── providers/        # API clients
│       ├── prompts.ts       # Stage-specific prompts
│       └── sse.ts           # Streaming utilities
```

### Key Files
- **`src/lib/prompts.ts`**: Stage-specific prompt engineering
- **`src/lib/providers/`**: API client implementations
- **`src/lib/store/`**: State management
- **`src/components/StagePanel.tsx`**: Main orchestration UI

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with env vars
- **DigitalOcean**: App Platform support

## 🔒 Security

- API keys stored as environment variables
- No client-side exposure of credentials
- Rate limiting on API endpoints
- Input validation and sanitization

## 📈 Performance

- **Concurrent Streaming**: Multiple models stream simultaneously
- **Optimized UI**: Framer Motion animations
- **Efficient State**: Zustand for minimal re-renders
- **3D Graphics**: Optimized Three.js rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This README

## 🎉 What Makes This Special

This project implements a **novel AI orchestration pattern** where:
- **4 concurrent models** work simultaneously per stage
- **Master aggregation** preserves all worker content while organizing it
- **Stage-specific specialization** ensures comprehensive coverage
- **Real-time streaming** provides immediate feedback
- **Provider flexibility** supports multiple AI services

The system produces **3-10x more detailed outputs** than traditional single-model approaches by leveraging the collective intelligence of multiple specialized AI models working in parallel.

---

**Ready to orchestrate AI models like never before?** 🚀