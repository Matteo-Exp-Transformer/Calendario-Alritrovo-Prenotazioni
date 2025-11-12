# 🤖 Automatic Agent Context - Calendario Al Ritrovo

**AUTO-LOADED for all Cursor agents (Codex, Sonnet, Composer)**

---

## ⚡ Quick Start for Agents

You're working on the **Calendario Al Ritrovo** booking system using React + TypeScript + Vite + Supabase.

### 1️⃣ First Thing: Check Your Location

```bash
pwd                           # Where am I?
git worktree list             # Show all worktrees
git branch --show-current     # What branch am I on?
```

### 2️⃣ Are You in a Worktree?

**If you see `.worktrees/` in your path**: ✅ You're good! Work independently.

**If you're in main repo**: Create a worktree first!
```bash
./scripts/manage-worktrees.sh create agent-yourname
cd .worktrees/agent-yourname
```

### 3️⃣ Essential Files to Read

Before coding, read these:

1. **Worktree Guide** (CRITICAL): [`docs/development/WORKTREE_WORKFLOW.md`](../docs/development/WORKTREE_WORKFLOW.md)
   - How to work with multiple agents
   - Avoid git conflicts
   - Best practices

2. **Quick Commands**: [`.worktree-quickstart.md`](./.worktree-quickstart.md)
   - Fast reference
   - Copy-paste commands

3. **Project Structure**: [`Skills/PROJECT_NAVIGATION.md`](./Skills/PROJECT_NAVIGATION.md)
   - Where files are
   - How to find components

4. **Project Status**: [`docs/agent-knowledge/PROJECT_STATUS.md`](../docs/agent-knowledge/PROJECT_STATUS.md)
   - What's done
   - Current state

---

## 🎯 Common Tasks & Solutions

### Task: Make code changes

**DO THIS FIRST**:
```bash
# 1. Check if you're in worktree
pwd

# 2. If NOT in worktree, create one
./scripts/manage-worktrees.sh create agent-task-name
cd .worktrees/agent-task-name

# 3. Now make changes safely!
```

### Task: Commit changes

```bash
# 1. Verify your branch
git branch --show-current    # Should be "agent/yourname"

# 2. Stage files
git add <files>

# 3. Commit
git commit -m "Description"

# 4. Verify
git log -1 --oneline
```

### Task: Merge back to main

```bash
# 1. Go back to main repo
cd ../..

# 2. Switch to main
git checkout main

# 3. Merge your work
git merge agent/agent-task-name

# 4. Clean up
./scripts/manage-worktrees.sh remove agent-task-name
```

---

## 🚨 Critical Warnings

### ❌ NEVER do this:
- Work in main repo when other agents are active
- Assume `git status` shows all changes (only YOUR worktree)
- Delete worktrees with uncommitted work
- Use `git checkout` to switch branches (you can't in worktrees - they're locked to one branch each)

### ✅ ALWAYS do this:
- Check your location: `pwd` and `git branch --show-current`
- Create worktree for parallel work
- Use management script: `./scripts/manage-worktrees.sh`
- Read the full guide: `docs/development/WORKTREE_WORKFLOW.md`

---

## 📁 Key File Locations

### Source Code
- **Booking features**: `src/features/booking/`
- **UI components**: `src/components/ui/`
- **Pages**: `src/pages/`
- **Types**: `src/types/`

### Tests
- **By category**: `e2e/booking-flow/`, `e2e/admin-crud/`, `e2e/menu/`, etc.
- **Helpers**: `e2e/helpers/`

### Configuration
- **Supabase client**: `src/lib/supabase.ts`
- **Database**: `supabase/migrations/`
- **Playwright**: `playwright.config.ts`

### Documentation
- **Main docs**: `docs/agent-knowledge/`
- **Worktree guide**: `docs/development/WORKTREE_WORKFLOW.md`
- **Test docs**: `e2e/README.md`

---

## 🛠️ Worktree Management Script

**Location**: `scripts/manage-worktrees.sh`

### Essential Commands

```bash
# Show all worktrees and their status
./scripts/manage-worktrees.sh list

# Create new worktree (auto installs npm deps)
./scripts/manage-worktrees.sh create agent-name

# Check for conflicts between worktrees
./scripts/manage-worktrees.sh check

# Remove worktree (warns if uncommitted changes)
./scripts/manage-worktrees.sh remove agent-name

# Clean up abandoned worktrees
./scripts/manage-worktrees.sh cleanup

# Full help
./scripts/manage-worktrees.sh help
```

---

## 🔍 Understanding Worktrees

### What is a Worktree?

A worktree is an **isolated copy** of the repository where you can work independently:

- **Separate directory**: `.worktrees/agent1/`, `.worktrees/agent2/`, etc.
- **Own branch**: Each worktree is locked to one branch
- **Independent changes**: Your `git status` only shows YOUR changes
- **Shared .git**: All worktrees share the same `.git` database

### Why Use Worktrees for Multi-Agent Work?

**Without worktrees** (traditional):
```
Repository/
├── file.ts (modified by agent 1)
└── other.ts (modified by agent 2)

Problem: Both agents see each other's changes in git status!
```

**With worktrees** (isolated):
```
Repository/
├── .worktrees/
│   ├── agent1/        # Agent 1 workspace
│   │   └── file.ts    # Modified here
│   └── agent2/        # Agent 2 workspace
│       └── other.ts   # Modified here

Result: Each agent only sees their own changes!
```

### Benefits

✅ No git checkout conflicts
✅ Parallel development without interference
✅ Each agent commits independently
✅ Easy to merge back to main
✅ Clean separation of work

---

## 🧪 Development Commands

```bash
# Start dev server (localhost:5175)
npm run dev

# Run all E2E tests
npm run test:e2e

# Run specific test
npx playwright test e2e/booking-flow/

# Run tests with UI
npx playwright test --ui

# Lint and fix code
npm run lint

# Install dependencies (auto-done in worktree creation)
npm install
```

---

## 💾 Git Configuration

The repository is already configured with:

```ini
[fetch]
  parallel = 4              # Parallel fetching for speed

[checkout]
  workers = 4               # 4 worker threads

[worktree]
  guessRemote = true        # Auto-track remote branches
```

---

## 📊 Repository Status

- **Main branch**: `main`
- **Remote**: GitHub (origin)
- **Worktrees directory**: `.worktrees/`
- **External worktrees**: Supported via `.cursor/worktrees/`

---

## 🆘 Troubleshooting

### Issue: "fatal: 'agent-name' is already checked out"

**Solution**: That worktree already exists or branch is in use
```bash
./scripts/manage-worktrees.sh list   # Check existing worktrees
./scripts/manage-worktrees.sh remove agent-name  # Remove if needed
```

### Issue: "Cannot remove worktree, uncommitted changes"

**Solution**: Commit or discard changes first
```bash
cd .worktrees/agent-name
git status                   # See changes
git add . && git commit -m "WIP"  # Commit them
# OR
git reset --hard HEAD        # Discard (CAREFUL!)
```

### Issue: "Not in a git repository"

**Solution**: You're in the wrong directory
```bash
cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup
# Or for worktree:
cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\.worktrees\agent-name
```

### Issue: "Script not found"

**Solution**: Make sure script is executable
```bash
chmod +x scripts/manage-worktrees.sh
./scripts/manage-worktrees.sh help
```

---

## 📚 Full Documentation Links

- **Comprehensive Worktree Guide**: [`docs/development/WORKTREE_WORKFLOW.md`](../docs/development/WORKTREE_WORKFLOW.md) (800+ lines, 6000+ words)
- **Setup Report**: [`docs/development/WORKTREE_SETUP_REPORT.md`](../docs/development/WORKTREE_SETUP_REPORT.md)
- **Quick Reference**: [`.worktree-quickstart.md`](./.worktree-quickstart.md)
- **Project Navigation**: [`Skills/PROJECT_NAVIGATION.md`](./Skills/PROJECT_NAVIGATION.md)

---

## 🎓 Learning Path for New Agents

**Day 1: Essential Reading** (15 min)
1. This file (you're reading it!)
2. Quick reference: [`.worktree-quickstart.md`](./.worktree-quickstart.md)
3. Try creating a test worktree

**Day 2: Deep Dive** (30 min)
1. Full guide: [`docs/development/WORKTREE_WORKFLOW.md`](../docs/development/WORKTREE_WORKFLOW.md)
2. Project structure: [`Skills/PROJECT_NAVIGATION.md`](./Skills/PROJECT_NAVIGATION.md)
3. Practice: Create, work, commit, merge, remove

**Day 3: Practice** (45 min)
1. Real task in a worktree
2. Parallel work with another agent
3. Handle merge conflicts
4. Review best practices

---

## ✅ Pre-Work Checklist

Before starting ANY task:

- [ ] Read this file (AGENT_CONTEXT.md)
- [ ] Check location: `pwd` and `git branch --show-current`
- [ ] Verify worktree status: `git worktree list`
- [ ] Read quick reference: `.worktree-quickstart.md`
- [ ] If parallel work needed, create worktree: `./scripts/manage-worktrees.sh create agent-yourname`

---

## 🎯 Summary: One Command to Rule Them All

```bash
# Create worktree, switch to it, and start working
./scripts/manage-worktrees.sh create agent-yourname && cd .worktrees/agent-yourname

# That's it! Now you're isolated and can work safely.
```

---

**Remember**: This context is automatically loaded. You have all this information available from the start!
