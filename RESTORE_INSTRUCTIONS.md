# Restore instructions (safe commands)

IMPORTANT: these commands affect your working tree. If you have uncommitted work you want to keep, make a backup copy of the project folder first.

1) If you want to discard all local, uncommitted changes and return to the last commit:
   git status          # inspect what's changed
   git restore .       # safer: restores tracked files to HEAD (Git 2.23+)
   git clean -fd       # removes untracked files/directories (BE CAREFUL)

   Or a single hard reset:
   git reset --hard HEAD

2) If you want to return to a specific earlier commit (check commit history first):
   git log --oneline --decorate --graph
   # pick the commit hash you want, then:
   git reset --hard <commit-hash>

3) If you accidentally reset and need to find recent commits/HEADs:
   git reflog
   # find the entry you want (HEAD@{n} or commit hash), then:
   git reset --hard HEAD@{n}

4) If you only want to restore one file from HEAD:
   git checkout -- path/to/file
   # or with modern git:
   git restore path/to/file

5) If you did not use git (or the desired changes were never committed):
   - Check your editor's local history (e.g., VSCode: Command Palette → "Local History" or "File: Reopen Closed Editor").
   - Check OS file history / snapshots / backups.
   - If you had previously saved a copy (zip) — restore from that.

6) After restore, restart dev server and clear build cache:
   # stop server (Ctrl+C), then:
   rm -rf .next
   npm run dev

Notes:
- Use `git status` and `git log` before running destructive commands to confirm.
- If you want, tell me which folder you prefer to keep (root magicgiftstudio vs nested copy). I can produce exact git commands to remove duplicates and update imports.

# Restore & Git-repair quick actions

Important: make a backup copy of the entire project folder before running destructive commands.

1) Quick inspection (do this first)
- git status
- git log --oneline --graph -n 50
- git reflog -n 50
- git fsck --no-reflogs --full

2) If "index" or "corrupt object" errors appear
- Backup index and remove it (safe to recreate):
  mv .git/index .git/index.bak
  git reset
- Rebuild refs if needed:
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  git fsck --full

3) Recover unstaged changes (if files undone by "undo")
- If files were lost but present in filesystem, stage and commit them:
  git add -A
  git status
  git commit -m "Restore working tree — local recovery"

4) If you want to create a new committed snapshot (safe local commit)
- Ensure identity set:
  git config user.name "Your Name"
  git config user.email "you@example.com"
- Stage and commit:
  git add -A
  git commit -m "Save: recovery commit"
- Optional: create a new branch to keep this snapshot safe:
  git branch recovery-snapshot
  git checkout recovery-snapshot

5) Remove duplicate nested folder (if confirmed duplicate)
- Inspect duplicates:
  # from project root
  ls -la
  # If nested "magicgiftstudio" exists and is duplicate, back it up then remove:
  mv magicgiftstudio magicgiftstudio.duplicate.bak
  git add -A
  git commit -m "Remove nested duplicate folder (backup saved)"

6) Final housekeeping
- Run garbage collection and verify:
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  git fsck --full

7) If the repository is not a git repo (or git is too broken)
- Create a new local repo, add current files and commit:
  mv .git .git.broken.backup   # backup old .git
  git init
  git add -A
  git commit -m "Initial commit (recreated repo after repair)"

8) After commit: restart dev server and clear build cache
- Stop server (Ctrl+C)
- rm -rf .next
- npm run dev

Notes
- Run commands step-by-step and check output; stop if something unexpected appears and ask before proceeding.  
- If you want, tell me which exact error message you see (paste full git error), or tell me you want me to apply a specific sequence and I will provide the exact commands to paste/run.
