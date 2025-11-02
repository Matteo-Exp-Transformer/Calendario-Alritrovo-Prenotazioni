# Superpowers: Calendario Al Ritrovo Development Guide

This is the **Calendario Al Ritrovo** booking management system, using React + TypeScript + Vite (with Supabase), FullCalendar for calendars, Tailwind CSS (with Radix UI), and Playwright for E2E testing. It runs using Vite dev server on `localhost:5175`. Read more about the business logic in [README_ALRITROVO.md](../README_ALRITROVO.md).

<EXTREMELY-IMPORTANT>
**You have Superpowers skills available.**

Before responding to ANY user message, you MUST complete this checklist:

1. ☐ List available skills in your mind (check `.claude/skills/`)
2. ☐ Ask yourself: "Does ANY skill match this request?"
3. ☐ If yes → Use the Skill tool to read and run the skill file
4. ☐ Announce which skill you're using
5. ☐ Follow the skill exactly

**If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST read the skill.**

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

---

## Initial Setup (already done)

Before you started, the following commands were already run for you: `npm install` set everything up, and `npm run dev` started the web app.

Nearly all changes you make, including to CSS, will result in a hot reload of the web app. However, if you make changes in the `package.json` file, then you will need to run `npm install` again, which is the only way to restart the web app.

---

## Commands useful in development

- `npm install` or `npm install <package_name>`: installs a new NPM package. You should aim to use only high-quality packages.
- `npx supabase db push`: pushes database migrations to Supabase. Consult `supabase/SETUP_DATABASE.md` for details.

---

## Linting and formatting

Human devs have IDEs that autoformat code on every file save. After you edit files, you must do the equivalent by running `npm run lint`.

This command will also report linter errors that were not automatically fixable. Use your judgement as to which of the linter violations should be fixed.

---

## Testing

- Run system tests (fast): `npm run test:e2e` or `npx playwright test`
- System tests (slower): `npx playwright test --ui` for UI mode
- System tests (debug): `npx playwright test --debug`
- All of the non-system and system tests (slow): `npm run test:e2e`

---

## Interacting with the app

The only way to interact with our web app is via the browser, at the URL given by `http://localhost:5175`. Using the browser to test functionality is an important part of your work.

You can use the Playwright MCP to sign in (see `.playwright-mcp/README.md`), and take screenshots so that you can test the functionality you develop. Use the `browser_take_screenshots` tool (use a subagent to tail at least 200 lines and return the relevant lines).

You should use a subagent for all app interaction tasks.

---

## Debugging

- You can view the web app logs at `npm run dev` output (use a subagent to tail at least 200 lines and return the relevant lines)
- If using the Playwright MCP, you can use the `browser_console_messages` tool (use a subagent to return the relevant lines)
- You can run code in the console if needed, but prefer direct testing via Playwright or browser interaction

---

## Patterns

Most AI functionality is in our own library called **Booking System**, located in `src/features/booking`.

The booking system has several key files that work together to handle bookings:

- [BookingForm.tsx](src/features/booking/components/BookingForm.tsx) handles user input for creating new bookings
- [BookingCalendar.tsx](src/features/booking/components/BookingCalendar.tsx) displays bookings in a calendar view using FullCalendar
- [useBookings.ts](src/features/booking/hooks/useBookings.ts) is a React Query hook that manages booking data fetching
- [bookingService.ts](src/features/booking/services/bookingService.ts) contains the business logic and API calls

Some other representative files that show the best patterns to follow:

- [AdminDashboard.tsx](src/pages/AdminDashboard.tsx) (main admin interface) shows how we structure pages with tabs and state management
- [useAuth.ts](src/hooks/useAuth.ts) is a custom hook showing our authentication patterns
- [Button.tsx](src/components/ui/Button.tsx) is the main UI component showing our Tailwind + variant patterns

We have our own UI components to style things, located in `src/components/ui/`.

We use **Radix UI** for complex UI components like Select dropdowns (e.g., `@radix-ui/react-select`).

We use **FullCalendar** for displaying and interacting with calendar views of bookings.

We value code that explains itself through clear class, method, and variable names. Comments may be used when necessary to explain some tricky business logic. We do NOT value code comments that repeat what the code says.

---

## Testing patterns with Playwright

Our E2E tests are in the `e2e/` folder. Key patterns:

- Tests interact with the actual running app on localhost:5175
- Use `page.goto()`, `page.click()`, `page.fill()` for interactions
- Use `expect()` assertions from `@playwright/test`
- Take screenshots for debugging: `await page.screenshot({ path: 'e2e/screenshots/filename.png' })`
- Tests run sequentially (`workers: 1`) to avoid database conflicts

Example test structure:
```typescript
import { test, expect } from '@playwright/test';

test('booking flow', async ({ page }) => {
  await page.goto('/prenota');
  await page.fill('[name="nome"]', 'Test User');
  // ... more interactions
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## Database & Supabase

We use **Supabase** (PostgreSQL + Auth + Storage) as our backend.

- Database schema: `supabase/migrations/001_initial_schema.sql`
- Row Level Security (RLS) policies protect data access
- Setup instructions: `supabase/SETUP_DATABASE.md`

Key tables:
- `booking_requests`: Main booking data (17 columns)
- `admin_users`: Admin authentication and roles
- `email_logs`: Email tracking
- `restaurant_settings`: Dynamic configuration

## 📚 Project Documentation

**Complete project documentation is available in `docs/agent-knowledge/`:**

These are the same files loaded in NotebookLM, but accessible directly to agents via file system.

**Main Files:**
- `README.md` - Project overview and quick start
- `PRD.md` - Complete Product Requirements Document
- `PROJECT_STATUS.md` - Current project status (January 27, 2025)
- `COMPLETION_REPORT.md` - Detailed completion report
- `ARCHITECTURE.md` - RLS architecture and Supabase client configuration
- `DATABASE_SETUP.md` - Database setup and schema
- `RLS_FIX.md` - RLS policies fixes and troubleshooting
- `SKILLS.md` - Available Superpowers skills

**When you need project information:**
1. **Read files in `docs/agent-knowledge/` first** - These contain all project knowledge
2. Use codebase_search or grep to find specific information
3. Cite the source file when answering

**Examples:**
- "How does RLS work?" → Read `docs/agent-knowledge/ARCHITECTURE.md`
- "What's the project status?" → Read `docs/agent-knowledge/PROJECT_STATUS.md`
- "I have an RLS error" → Read `docs/agent-knowledge/RLS_FIX.md`
- "How to setup database?" → Read `docs/agent-knowledge/DATABASE_SETUP.md`

**Note:** These files are synced with NotebookLM. For quick exploration, the human partner can query NotebookLM. For development work, read these files directly using read_file or codebase_search tools.

---

## Environment Variables

We use environment variables for configuration (see `.env.local`):

```bash
# Supabase
VITE_SUPABASE_URL=https://dphuttzgdcerexunebct.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Resend Email
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@resend.dev
SENDER_NAME=Al Ritrovo

# App Config
VITE_APP_ENV=development
VITE_RESTAURANT_NAME=Al Ritrovo
VITE_RESTAURANT_ADDRESS=Bologna, Italia
```

---

## Available Superpowers Skills

All skills are in `.claude/skills/`. Key skills for this project:

### Critical Skills (MANDATORY):

- **`systematic-debugging/`** ⭐ - 4-phase debugging process (use BEFORE proposing fixes)
- **`test-driven-development/`** ⭐ - RED-GREEN-REFACTOR (use for ALL code changes)
- **`verification-before-completion/`** ⭐ - Verify before claiming done (use ALWAYS)
- **`root-cause-tracing/`** - Trace bugs backward through call stack

### Development Workflow Skills:

- **`brainstorming/`** - Design refinement before coding (use BEFORE implementing features)
- **`writing-plans/`** - Create detailed implementation plans
- **`executing-plans/`** - Execute plans in controlled batches
- **`subagent-driven-development/`** - Development with subagents + code review
- **`using-git-worktrees/`** - Isolated feature development

### Testing Skills:

- **`condition-based-waiting/`** - Reliable async test patterns (for Playwright tests)
- **`testing-anti-patterns/`** - Common testing mistakes to avoid

### Code Quality Skills:

- **`requesting-code-review/`** - Dispatch code review before merging
- **`receiving-code-review/`** - Handle code review feedback properly
- **`finishing-a-development-branch/`** - Complete dev work with structured options

### Debugging & Problem Solving:

- **`defense-in-depth/`** - Multi-layer validation to prevent bugs
- **`dispatching-parallel-agents/`** - Investigate 3+ independent failures concurrently

### Skills Management:

- **`using-superpowers/`** ⭐ - MANDATORY first response protocol
- **`writing-skills/`** - Create new skills with TDD approach
- **`testing-skills-with-subagents/`** - Test skills before deployment
- **`sharing-skills/`** - Contribute skills via PR

---

## Critical Rules

1. **Follow mandatory workflows.** Brainstorming before coding. Check for relevant skills before ANY task.

2. **Execute skills with the Skill tool** - Don't just reference them, actually read and follow them.

3. **Skills with checklists = TodoWrite todos for EACH item.** Don't skip creating todos.

4. **Announce skill usage** - Before using a skill, announce: "I'm using [Skill Name] to [what you're doing]."

---

## Common Rationalizations (WRONG)

If you catch yourself thinking ANY of these, STOP. You are rationalizing:

- "This is just a simple question" → WRONG. Questions are tasks. Check for skills.
- "I can check git/files quickly" → WRONG. Files don't have conversation context. Check for skills.
- "Let me gather information first" → WRONG. Skills tell you HOW to gather information.
- "This doesn't need a formal skill" → WRONG. If a skill exists for it, use it.
- "I remember this skill" → WRONG. Skills evolve. Run the current version.
- "The skill is overkill for this" → WRONG. Skills exist because simple things become complex.

**Why:** Skills document proven techniques that save time and prevent mistakes. Not using available skills means repeating solved problems.

---

## Instructions ≠ Permission to Skip Workflows

User's specific instructions describe WHAT to do, not HOW.

"Add X", "Fix Y" = the goal, NOT permission to skip:
- Brainstorming before coding
- TDD (RED-GREEN-REFACTOR)
- Systematic debugging
- Verification before completion

**Red flags:** "Instruction was specific" • "Seems simple" • "Workflow is overkill"

Specific instructions mean clear requirements, which is when workflows matter MOST.

---

## Skills Integration Status

✅ All Superpowers skills are installed in `.claude/skills/`
✅ Skills are automatically discovered by Claude Code
✅ Code reviewer agent available at `.claude/skills/requesting-code-review/code-reviewer.md`
✅ Automatic permission for `using-superpowers` skill in `.claude/settings.local.json`

**For complete skill documentation**, see `.claude/skills/README.md`

---

**Remember: Finding a relevant skill = mandatory to read and use it. Not optional.**

