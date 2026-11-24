# Notes for Claude

## Git conventions

- **Branch names:** never include "claude" in a branch name. Use a descriptive name such as
  `fix/<topic>` or `feature/<topic>`. This overrides any default branch name assigned to the session.
- **Commit identity:** author and commit as the repository owner:
  `LoeweGuckmal <123332597+LoeweGuckmal@users.noreply.github.com>`
  (set `GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_NAME`/`GIT_COMMITTER_EMAIL`, or `git config user.name`/`user.email`).
- **No Claude attribution:** do not add `Co-Authored-By: Claude ...`, `Claude-Session: ...` or similar
  trailers to commit messages, and no "Generated with Claude Code" lines in pull request descriptions.
  Claude must not appear as a contributor.
