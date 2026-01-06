# Git Worktree Workflow for Parallel Agent Development

## Overview

This document describes how to use git worktrees to enable multiple Claude agents to work in parallel on different features without interfering with each other.

**Problem Solved:** When multiple agents work on the same repository simultaneously, they can experience:
- Git command conflicts (both trying to checkout different branches)
- File synchronization issues
- Accidental overwrites of each other's work
- Difficulty tracking which agent is working on what

**Solution:** Git worktrees create isolated workspaces that share the same repository. Each agent gets its own worktree with its own working directory and branch, allowing truly independent parallel work.

## Quick Start

### For Human Developers

```bash
# List existing worktrees
./scripts/manage-worktrees.sh list

# Create a worktree for agent1
./scripts/manage-worktrees.sh create agent1

# Create a worktree for agent2 based on a specific branch
./scripts/manage-worktrees.sh create agent2 feature/new-menu

# Check for conflicts
./scripts/manage-worktrees.sh check

# Remove a worktree when done
./scripts/manage-worktrees.sh remove agent1

# Clean up abandoned worktrees
./scripts/manage-worktrees.sh cleanup
```

### For Claude Agents

When instructed to work in a worktree:

1. **Check if worktree exists:**
   ```bash
   ls -la c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\.worktrees
   ```

2. **If your worktree doesn't exist, create it:**
   ```bash
   cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup
   ./scripts/manage-worktrees.sh create agent1
   ```

3. **Work in your worktree:**
   ```bash
   cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\.worktrees\agent1
   # Make changes, commit, etc.
   ```

4. **When done, return to main and remove worktree:**
   ```bash
   cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup
   ./scripts/manage-worktrees.sh remove agent1
   ```

## Repository Configuration

### Git Settings

The repository is configured with these git settings for optimal parallel operation:

```bash
fetch.parallel=4          # Fetch from multiple remotes in parallel
checkout.workers=4        # Use 4 workers for checkout operations
worktree.guessRemote=true # Automatically guess remote tracking branch
```

These settings are stored in `.git/config` and apply to all worktrees.

### .gitignore Configuration

The following patterns are in `.gitignore` to prevent tracking worktree directories:

```
.worktrees/    # Project-local worktrees (recommended)
worktrees/     # Alternative naming
.cursor/       # External worktrees used by Cursor/Claude
```

## Worktree Directory Structure

### Option 1: Project-Local (Recommended)

```
Calendarbackup/
├── .git/
├── .worktrees/              # Worktree directory (gitignored)
│   ├── agent1/              # Agent 1's workspace
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...              # Full copy of repository on branch agent/agent1
│   ├── agent2/              # Agent 2's workspace
│   │   └── ...              # Full copy of repository on branch agent/agent2
│   └── feature-x/           # Named feature workspace
│       └── ...              # Full copy of repository on branch agent/feature-x
├── src/
├── package.json
└── ...                      # Main repository (main branch)
```

**Advantages:**
- All worktrees in one place
- Easy to find and manage
- Automatically cleaned up with project

**Disadvantages:**
- Takes up disk space in project directory
- Multiple node_modules folders

### Option 2: External Location

```
C:\Users\matte.MIO\.cursor\worktrees\Calendarbackup\
├── 7P0zo/                   # Random ID workspace
│   └── ...
└── agent1/                  # Named workspace
    └── ...
```

**Advantages:**
- Keeps project directory clean
- Shared across all projects using Cursor

**Disadvantages:**
- Harder to find and manage
- May be forgotten and not cleaned up

## Workflow Patterns

### Pattern 1: Parallel Feature Development

**Scenario:** Two agents working on independent features

```bash
# Human: Launch Agent 1
# Agent 1:
cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup
./scripts/manage-worktrees.sh create agent1
cd .worktrees/agent1
# Work on feature A...
git add .
git commit -m "Implement feature A"

# Human: Launch Agent 2 (in parallel)
# Agent 2:
cd c:\Users\matte.MIO\Documents\GitHub\Calendarbackup
./scripts/manage-worktrees.sh create agent2
cd .worktrees/agent2
# Work on feature B...
git add .
git commit -m "Implement feature B"

# Both agents work independently without conflicts!
```

### Pattern 2: Testing Different Approaches

**Scenario:** Try multiple solutions to the same problem

```bash
# Agent 1: Approach A (using Redux)
./scripts/manage-worktrees.sh create test-redux
cd .worktrees/test-redux
# Implement solution with Redux...

# Agent 2: Approach B (using Context API)
./scripts/manage-worktrees.sh create test-context
cd .worktrees/test-context
# Implement solution with Context API...

# Human: Compare both approaches and choose the best one
```

### Pattern 3: Sequential Tasks with Cleanup

**Scenario:** One agent finishes, another takes over

```bash
# Agent 1: Task 1
./scripts/manage-worktrees.sh create agent1
cd .worktrees/agent1
# Complete task 1...
git add . && git commit -m "Complete task 1"
git push origin agent/agent1

# Agent 1: Cleanup
cd ../..
./scripts/manage-worktrees.sh remove agent1

# Agent 2: Task 2 (based on Agent 1's work)
./scripts/manage-worktrees.sh create agent2 agent/agent1
cd .worktrees/agent2
# Build on task 1...
```

## Best Practices

### For Agents

1. **Always check before creating:**
   ```bash
   ./scripts/manage-worktrees.sh list
   ```
   Don't create a worktree if one with your name already exists.

2. **Use descriptive names:**
   - Good: `agent-menu-refactor`, `agent-auth-fix`, `test-approach-a`
   - Bad: `temp`, `test`, `work`

3. **Install dependencies after creation:**
   The script automatically runs `npm install`, but verify:
   ```bash
   cd .worktrees/your-name
   npm install  # If needed
   ```

4. **Commit regularly:**
   Worktrees are isolated, so commit often without fear of breaking others:
   ```bash
   git add .
   git commit -m "WIP: intermediate progress"
   ```

5. **Clean up when done:**
   ```bash
   ./scripts/manage-worktrees.sh remove your-name
   ```

### For Humans

1. **Monitor active worktrees:**
   ```bash
   ./scripts/manage-worktrees.sh list
   ./scripts/manage-worktrees.sh check
   ```

2. **Clean up periodically:**
   ```bash
   ./scripts/manage-worktrees.sh cleanup
   ```

3. **Name worktrees by purpose:**
   - `agent1`, `agent2` for parallel work
   - `test-X` for experiments
   - `feature-X` for specific features

4. **Merge carefully:**
   When merging worktree branches back to main:
   ```bash
   # In main repository
   git checkout main
   git merge agent/agent1
   git push origin main
   ```

## Common Issues and Solutions

### Issue 1: "Worktree already exists"

**Problem:** Trying to create a worktree that already exists.

**Solution:**
```bash
# List all worktrees
./scripts/manage-worktrees.sh list

# Remove the old one if safe
./scripts/manage-worktrees.sh remove agent1

# Or use a different name
./scripts/manage-worktrees.sh create agent1-v2
```

### Issue 2: "Branch already exists"

**Problem:** The branch name is already in use.

**Solution:**
The script will ask if you want to use the existing branch. Choose:
- **Yes:** Use existing branch (useful for resuming work)
- **No:** Abort and choose a different name

### Issue 3: Uncommitted changes warning

**Problem:** Trying to remove a worktree with uncommitted changes.

**Solution:**
```bash
# Option A: Commit the changes
cd .worktrees/agent1
git add .
git commit -m "Save work"
cd ../..
./scripts/manage-worktrees.sh remove agent1

# Option B: Force remove (loses changes)
# The script will ask for confirmation
./scripts/manage-worktrees.sh remove agent1
# Answer 'y' to confirm
```

### Issue 4: Disk space concerns

**Problem:** Multiple worktrees with node_modules take up space.

**Solution:**
```bash
# Option A: Use external worktree location
# Instead of .worktrees/, use ~/.config/superpowers/worktrees/

# Option B: Share node_modules (advanced)
# Use npm workspaces or pnpm (requires project reconfiguration)

# Option C: Clean up aggressively
./scripts/manage-worktrees.sh cleanup
```

### Issue 5: Merge conflicts between agents

**Problem:** Two agents modified the same files.

**Solution:**
```bash
# This is expected! Git handles it normally.
# In main repository:
git merge agent/agent1
# Resolve conflicts if any
git merge agent/agent2
# Resolve conflicts if any
git push origin main
```

## Advanced Usage

### Using the Superpowers Skill

For agents with access to the `using-git-worktrees` skill:

```bash
# The skill handles:
# 1. Directory selection (.worktrees/ vs external)
# 2. .gitignore verification
# 3. Automatic dependency installation
# 4. Test baseline verification
```

See `.claude/skills/using-git-worktrees/README.md` for details.

### Manual Worktree Operations

If the script doesn't meet your needs, use git directly:

```bash
# Create worktree manually
git worktree add .worktrees/custom-name -b feature/custom main

# List worktrees (detailed)
git worktree list --porcelain

# Remove worktree manually
git worktree remove .worktrees/custom-name

# Prune stale worktree references
git worktree prune
```

### Sharing Worktrees Across Machines

Worktrees are local only. To share work:

```bash
# In worktree:
git push origin agent/agent1

# On another machine:
git fetch origin
git checkout agent/agent1
# Or create a worktree:
./scripts/manage-worktrees.sh create agent1-remote agent/agent1
```

## Integration with CI/CD

Worktrees are for local development only. CI/CD pipelines should:

1. **Ignore worktree directories:** Already in `.gitignore`
2. **Work with branches:** Each worktree has its own branch
3. **Test branch builds:** Standard CI process

Example GitHub Actions workflow:

```yaml
# Worktree branches follow pattern: agent/*
name: Test Agent Branches
on:
  push:
    branches:
      - 'agent/**'
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
```

## Performance Considerations

### Disk Space

Each worktree is a full copy:
- Source code: ~50MB
- node_modules: ~200MB
- Build artifacts: ~100MB

**Total per worktree:** ~350MB

**With 3 agents:** ~1GB additional space

### Git Operations

Worktrees share `.git` directory:
- Commits in one worktree don't affect others
- Fetches are shared (faster!)
- Branches are visible across all worktrees

### Build Performance

Each worktree has its own node_modules:
- **Advantage:** Independent dependency versions for testing
- **Disadvantage:** Multiple npm installs take time and space

**Optimization:** Use pnpm or Yarn with shared cache.

## Troubleshooting

### Script doesn't run

```bash
# Make sure it's executable
chmod +x scripts/manage-worktrees.sh

# Run with bash explicitly
bash scripts/manage-worktrees.sh list
```

### Git commands fail in worktree

```bash
# Verify worktree is valid
cd .worktrees/agent1
git status

# If broken, remove and recreate
cd ../..
git worktree remove .worktrees/agent1 --force
./scripts/manage-worktrees.sh create agent1
```

### Can't switch branches in main repo

**This is expected!** Each worktree locks its branch.

```bash
# Wrong: Try to checkout agent/agent1 in main repo
git checkout agent/agent1
# Error: branch is checked out in another worktree

# Right: Work in the worktree
cd .worktrees/agent1
# Already on agent/agent1 branch
```

## Migration Guide

### From Single Repository to Worktrees

If you have agents working in the main repository:

```bash
# Before (conflicts possible):
# Agent 1: git checkout feature-a
# Agent 2: git checkout feature-b  # ERROR!

# After (no conflicts):
# Agent 1:
./scripts/manage-worktrees.sh create agent1
cd .worktrees/agent1

# Agent 2:
./scripts/manage-worktrees.sh create agent2
cd .worktrees/agent2
```

### From External Worktrees to Project-Local

If you have worktrees in `~/.cursor/worktrees/`:

```bash
# 1. List external worktrees
git worktree list

# 2. For each one, remove and recreate locally
git worktree remove ~/.cursor/worktrees/Calendarbackup/7P0zo
./scripts/manage-worktrees.sh create 7P0zo

# 3. Restore any uncommitted work
# (Copy files from old location if needed)
```

## References

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Superpowers using-git-worktrees skill](./.claude/skills/using-git-worktrees/README.md)
- [Project-specific script](./scripts/manage-worktrees.sh)

## Summary

**Key Takeaways:**

1. Worktrees enable parallel agent work without conflicts
2. Use `./scripts/manage-worktrees.sh` for all worktree operations
3. Each agent gets its own isolated workspace and branch
4. Clean up worktrees when done to save disk space
5. Worktree branches can be merged back to main like any branch

**When to Use Worktrees:**

- Multiple agents working simultaneously
- Testing different approaches to the same problem
- Need to preserve context while switching tasks
- Want to avoid git checkout conflicts

**When NOT to Use Worktrees:**

- Single agent, sequential tasks (just use git branches)
- Very large repositories (disk space concerns)
- Temporary experiments (use git stash instead)

---

**Questions?** Check the script help: `./scripts/manage-worktrees.sh help`
