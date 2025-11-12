#!/bin/bash
# Git Worktree Management Script for Parallel Agent Work
# Usage: ./scripts/manage-worktrees.sh [command] [args]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
WORKTREE_DIR="$REPO_ROOT/.worktrees"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Ensure we're in a git repository
check_git_repo() {
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        print_error "Not inside a git repository"
        exit 1
    fi
}

# List all worktrees
list_worktrees() {
    print_info "Git worktrees in this repository:"
    echo ""
    git worktree list

    echo ""
    print_info "Worktree directory structure:"
    if [ -d "$WORKTREE_DIR" ]; then
        ls -la "$WORKTREE_DIR" 2>/dev/null || echo "  (empty)"
    else
        echo "  .worktrees/ directory not yet created"
    fi
}

# Create a new worktree for agent work
create_worktree() {
    local agent_name="$1"
    local base_branch="${2:-main}"

    if [ -z "$agent_name" ]; then
        print_error "Agent name is required"
        echo "Usage: $0 create <agent-name> [base-branch]"
        echo "Example: $0 create agent1 main"
        exit 1
    fi

    local branch_name="agent/$agent_name"
    local worktree_path="$WORKTREE_DIR/$agent_name"

    # Check if worktree already exists
    if [ -d "$worktree_path" ]; then
        print_error "Worktree already exists at: $worktree_path"
        print_info "Use 'remove' command to clean up first, or use 'list' to see all worktrees"
        exit 1
    fi

    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        print_warning "Branch '$branch_name' already exists"
        read -p "Do you want to use the existing branch? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Aborted"
            exit 0
        fi

        # Use existing branch
        print_info "Creating worktree with existing branch: $branch_name"
        git worktree add "$worktree_path" "$branch_name"
    else
        # Create new branch from base
        print_info "Creating worktree: $worktree_path"
        print_info "Branch: $branch_name (from $base_branch)"
        git worktree add -b "$branch_name" "$worktree_path" "$base_branch"
    fi

    print_success "Worktree created at: $worktree_path"

    # Install dependencies if package.json exists
    if [ -f "$worktree_path/package.json" ]; then
        print_info "Installing dependencies in worktree..."
        (cd "$worktree_path" && npm install)
        print_success "Dependencies installed"
    fi

    echo ""
    print_info "To use this worktree:"
    echo "  cd $worktree_path"
    echo "  # Make your changes"
    echo "  git add ."
    echo "  git commit -m 'Your message'"
    echo ""
    print_info "When done, use: $0 remove $agent_name"
}

# Remove a worktree
remove_worktree() {
    local agent_name="$1"

    if [ -z "$agent_name" ]; then
        print_error "Agent name is required"
        echo "Usage: $0 remove <agent-name>"
        exit 1
    fi

    local worktree_path="$WORKTREE_DIR/$agent_name"

    # Check if worktree exists
    if [ ! -d "$worktree_path" ]; then
        print_error "Worktree does not exist at: $worktree_path"
        print_info "Use 'list' to see all worktrees"
        exit 1
    fi

    # Check for uncommitted changes
    if ! git -C "$worktree_path" diff --quiet || ! git -C "$worktree_path" diff --cached --quiet; then
        print_warning "Worktree has uncommitted changes!"
        git -C "$worktree_path" status --short
        echo ""
        read -p "Are you sure you want to remove this worktree? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Aborted"
            exit 0
        fi
    fi

    print_info "Removing worktree: $worktree_path"
    git worktree remove "$worktree_path" --force
    print_success "Worktree removed"
}

# Clean up abandoned/orphaned worktrees
cleanup_worktrees() {
    print_info "Cleaning up abandoned worktrees..."

    # Prune removes references to worktrees that no longer exist
    git worktree prune

    print_success "Cleanup complete"

    # Show remaining worktrees
    echo ""
    list_worktrees
}

# Check for conflicts between worktrees
check_conflicts() {
    print_info "Checking for potential conflicts between worktrees..."

    # Get list of worktrees (skip header)
    local worktree_list=$(git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2)

    if [ -z "$worktree_list" ]; then
        print_info "No worktrees found (only main repository)"
        return
    fi

    local has_conflicts=false

    # Check each worktree for uncommitted changes
    while IFS= read -r wt_path; do
        if [ -d "$wt_path" ]; then
            local branch=$(git -C "$wt_path" branch --show-current)
            local status=$(git -C "$wt_path" status --short)

            if [ -n "$status" ]; then
                if [ "$has_conflicts" = false ]; then
                    echo ""
                    print_warning "Found worktrees with uncommitted changes:"
                    has_conflicts=true
                fi
                echo ""
                echo "  Path: $wt_path"
                echo "  Branch: $branch"
                echo "  Status:"
                echo "$status" | sed 's/^/    /'
            fi
        fi
    done <<< "$worktree_list"

    if [ "$has_conflicts" = false ]; then
        print_success "No conflicts detected - all worktrees are clean"
    else
        echo ""
        print_info "Tip: Commit or stash changes before creating new worktrees"
    fi
}

# Show usage
usage() {
    cat << EOF
Git Worktree Management Script

Usage: $0 <command> [args]

Commands:
  list                          List all worktrees
  create <name> [base-branch]   Create new worktree for agent work
  remove <name>                 Remove a worktree
  cleanup                       Clean up abandoned worktrees
  check                         Check for conflicts between worktrees
  help                          Show this help message

Examples:
  $0 list
  $0 create agent1
  $0 create agent2 main
  $0 remove agent1
  $0 cleanup
  $0 check

Worktrees are created in: $WORKTREE_DIR

For parallel agent work:
  1. Create separate worktrees for each agent
  2. Each agent works independently in its own worktree
  3. Agents can commit without interfering with each other
  4. Merge branches back to main when done
  5. Clean up worktrees after merging

EOF
}

# Main command dispatcher
main() {
    check_git_repo

    local command="${1:-help}"

    case "$command" in
        list|ls)
            list_worktrees
            ;;
        create|new)
            shift
            create_worktree "$@"
            ;;
        remove|rm|delete)
            shift
            remove_worktree "$@"
            ;;
        cleanup|prune)
            cleanup_worktrees
            ;;
        check|status)
            check_conflicts
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
