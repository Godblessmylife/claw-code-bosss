# JP Code — Roadmap & Improvement Plan 2026

## Current Architecture (as of v1.6.1)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind v4 | App Router, RSC |
| AI | Anthropic Claude claude-opus-4-5 via AI SDK v6 | Streaming via SSE |
| Storage | localStorage (per-user, anonymous UUID) | No backend DB yet |
| Auth | Anonymous UUID in localStorage | No login system |
| Deploy | Vercel | Edge-ready |
| Domain | JPCODE.COM (target) | Current: Vercel subdomain |

---

## 1. Performance & Speed

### 1.1 Model Response Speed
- **Problem**: Claude Opus is powerful but slower than Sonnet/Haiku for simple tasks.
- **Fix**: Add model selector in UI — Claude O.G for complex tasks, Claude Haiku for quick edits/questions.
- **Impact**: 3-5x speed increase on simple queries.

### 1.2 Streaming UX (done in v1.6.1)
- Raw text during streaming is now hidden behind `GenerationProgress`.
- Files appear as chips as they are parsed from the stream.

### 1.3 Response Caching
- Cache identical prompts per user with a 1h TTL using Upstash Redis.
- Use `unstable_cache` / route-level caching in Next.js 16 for repeated requests.

### 1.4 Edge Runtime
- Move `/api/chat` and `/api/code` to `export const runtime = 'edge'` — reduces cold start from ~800ms to ~50ms.

### 1.5 Code Parsing Optimization
- Current: re-parse ALL messages on every render to build `activeFiles`.
- Fix: memoize with `useMemo`, only re-compute when `messages` array reference changes.

---

## 2. UX / Product Improvements

### 2.1 Streaming File Panel (like v0)
- As the model writes code, each completed file should appear in the file tree immediately.
- Current: files appear only after the full block is closed (``` delimiter).
- Fix: use a streaming parser that detects partial blocks and shows "writing..." state in the file tree.

### 2.2 Code Editor — Syntax Highlighting
- Current: plain `<pre><code>` block.
- Add: `shiki` or `prism-react-renderer` for syntax highlighting.
- Impact: major visual quality improvement, professional feel.

### 2.3 Inline Code Editing
- Allow users to edit files directly in the code panel (Monaco Editor or CodeMirror 6).
- Changes auto-save to project storage.
- Diff view when the AI updates a file.

### 2.4 Chat Message Improvements
- Markdown rendering in chat bubbles (headers, bold, lists, inline code).
- Copy-to-clipboard on code blocks.
- Message edit / regenerate (like v0's re-run button).

### 2.5 Smarter Project Naming
- Auto-extract a meaningful project name from the first user message using the AI.
- Currently defaults to "my-project".

### 2.6 Project Versioning
- Snapshot each generation as a version (v1, v2...) inside the project.
- Allow rollback to any previous version.

### 2.7 Multi-Session / Branching
- Allow branching a conversation from any message.
- Multiple chat sessions per project.

---

## 3. Backend & Storage Migration

### 3.1 Move from localStorage to Supabase
- **Why**: localStorage is per-device, can be cleared, and is not shareable.
- **Tables needed**:
  - `users` (id, created_at, anon_id)
  - `projects` (id, user_id, name, description, created_at, updated_at)
  - `project_files` (id, project_id, name, language, content)
  - `chat_messages` (id, project_id, role, content, created_at)
- **Auth**: Supabase anonymous auth first, then optional email/Google upgrade.

### 3.2 File Storage
- Large projects (>500KB) should store files in Vercel Blob instead of DB.
- Store only file metadata in Supabase.

### 3.3 Real-time Sync
- Use Supabase Realtime to sync projects across devices instantly.

---

## 4. Authentication & Security

### 4.1 Auth Tiers
| Tier | Features | Auth |
|---|---|---|
| Anonymous | 3 projects, 20 messages/day | UUID cookie |
| Free account | 10 projects, 50 messages/day | Supabase email/Google |
| Pro | Unlimited, priority model | Stripe subscription |

### 4.2 Rate Limiting
- Add Upstash Redis rate limiting on `/api/chat` and `/api/code`.
- Limits: 20 req/hour anonymous, 50 req/hour free, unlimited Pro.
- Return `429` with `Retry-After` header.

### 4.3 Input Sanitization
- Sanitize all user input before sending to the model.
- Block prompt injection attempts (jailbreak patterns).

### 4.4 API Key Security
- Anthropic API key is server-side only (already correct).
- Never expose to client. Validate request origin.

### 4.5 Content Security Policy
- Add strict CSP headers in `next.config.js`.
- Block XSS via `X-Frame-Options`, `X-Content-Type-Options`.

---

## 5. Monetization

### 5.1 Stripe Subscription
- Pro plan: $12/month or $99/year.
- Features: unlimited projects, Claude O.G priority, Monaco editor, private projects, custom domain deploy.
- Stripe Checkout via `/api/stripe/create-session`.
- Webhook handler for subscription lifecycle.

### 5.2 Usage-Based Billing
- Count tokens per user per month.
- Free tier: 100K tokens/month.
- Pro: 2M tokens/month.

### 5.3 Team Plans
- $49/month for up to 5 seats.
- Shared project workspace, team comments, code review.

### 5.4 Marketplace
- Users can publish project templates to a public gallery.
- Featured templates = paid placement.

### 5.5 API Access
- Expose JP Code as an API for developers.
- Charge per 1000 tokens processed.

---

## 6. Feature Additions

### 6.1 Terminal / Shell Runner
- Integrate a WebContainer (StackBlitz WebContainers API) or E2B sandbox.
- Run Node.js, Python, Rust code directly in the browser.
- Show real terminal output in the preview panel.

### 6.2 Live Preview for Web Projects
- Iframe preview (already partially implemented).
- Automatic refresh when files change.
- Mobile/desktop viewport switcher in preview.

### 6.3 Git Integration
- Connect to GitHub / GitLab.
- Push generated project to a new repo in one click.
- Import existing repo → JP Code analyzes and continues development.

### 6.4 Multi-File Upload / Import
- Drag and drop existing project files.
- JP Code reads them and continues from where you left off.

### 6.5 Collaborative Mode
- Real-time collaboration on a project (like Figma for code).
- Powered by Supabase Realtime + CRDT (Yjs).

### 6.6 Deploy in One Click
- Auto-deploy to Vercel from within JP Code.
- Use Vercel API to create project + push files.
- Connect custom domain automatically.

### 6.7 Agents & Multi-Step Tasks
- Break large requests into sub-tasks.
- Each sub-task has its own generation + validation step.
- Use Vercel Workflow SDK for durable multi-step pipelines.

### 6.8 Testing Integration
- After generating code, auto-run: TypeScript type check, ESLint, Vitest/Jest.
- Show pass/fail in the UI.

---

## 7. Mobile App

### 7.1 PWA
- Add `manifest.json` with app name, icons, `display: standalone`.
- Service worker for offline access to saved projects.
- Install prompt on mobile.

### 7.2 React Native App
- Companion mobile app for reviewing/running projects.
- Push notifications when long generation finishes.

---

## 8. Analytics & Monitoring

### 8.1 PostHog
- Track: message sent, file generated, project saved, deploy clicked, share clicked.
- Funnel: anonymous -> registered -> paid.

### 8.2 Sentry
- Error tracking for API routes and client components.
- Session replay on errors.

### 8.3 Vercel Analytics
- Core Web Vitals per page.

---

## 9. Priority Order (Next 3 Months)

| Priority | Task | Impact |
|---|---|---|
| P0 | Edge runtime for API routes | Speed |
| P0 | Model selector (Opus vs Haiku) | Speed + cost |
| P0 | Rate limiting (Upstash Redis) | Security |
| P1 | Supabase backend migration | Persistence |
| P1 | Stripe Pro subscription | Revenue |
| P1 | Syntax highlighting (shiki) | UX |
| P1 | Monaco editor (inline editing) | UX |
| P2 | WebContainer / E2B runner | WOW factor |
| P2 | GitHub push integration | Power user |
| P2 | PWA manifest | Mobile |
| P3 | Team plans | Revenue |
| P3 | Collaborative mode | Viral growth |
