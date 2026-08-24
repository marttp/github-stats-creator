# GitHub Stats Creator

A GitHub Action that generates a clean, static SVG stats card from your GitHub profile and pushes it to your repository.

## Preview

![default theme](examples/default.svg)

## Features

- **Impact/Activity split**: Stars & contributions on the left, commits, PRs & issues on the right
- **10 themes**: default, dark, radical, gruvbox, tokyonight, onedark, dracula, monokai, nord, highcontrast
- **Self-contained**: No external services — runs entirely inside the Action
- **Auto-detects user**: Defaults to the repository owner
- **Static SVG**: No animations or CSS — renders consistently as a static image

## Quick Start

```yaml
name: Update GitHub Stats

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  stats:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Generate stats card
        uses: marttp/github-stats-creator@v1
        with:
          github_token: ${{ secrets.STATS_TOKEN }}
```

`STATS_TOKEN` is a personal access token you create and add as a repo secret — see [Token Scopes](#token-scopes) below. The default `GITHUB_TOKEN` will not work; it can only read the repo the workflow runs in, not your other repos, so the stats query is rejected.

Then embed in your README:

```markdown
![My GitHub Stats](./gh-stats.svg)
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github_user_name` | GitHub username. Defaults to the repository owner. | No | `""` (auto-detected) |
| `github_token` | Classic personal access token with `public_repo` (or `repo`) and `read:user` scopes. Fine-grained PATs don't work — see [Token Scopes](#token-scopes). | Yes | `${{ github.token }}` |
| `theme` | Theme preset (see below) | No | `default` |
| `output_path` | Output file path for the SVG | No | `gh-stats.svg` |
| `commit_message` | Git commit message when pushing the SVG | No | `Update GitHub stats SVG [skip ci]` |
| `show_icons` | Show icons on the stats card | No | `true` |
| `include_all_commits` | Include all-time commits (uses REST API, may be slower) | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `svg_path` | Path to the generated SVG file |

## Themes

| Theme | Preview |
|-------|---------|
| `default` | ![default](examples/default.svg) |
| `dark` | ![dark](examples/dark.svg) |
| `radical` | ![radical](examples/radical.svg) |
| `gruvbox` | ![gruvbox](examples/gruvbox.svg) |
| `tokyonight` | ![tokyonight](examples/tokyonight.svg) |
| `onedark` | ![onedark](examples/onedark.svg) |
| `dracula` | ![dracula](examples/dracula.svg) |
| `monokai` | ![monokai](examples/monokai.svg) |
| `nord` | ![nord](examples/nord.svg) |
| `highcontrast` | ![highcontrast](examples/highcontrast.svg) |

## Permissions

The workflow requires `contents: write` permission to commit and push the SVG file.

## Token Scopes

The stats card aggregates data (stars, PRs, issues) across all of your repositories, not just the one the workflow runs in. The default `GITHUB_TOKEN` is scoped to a single repo and cannot read that data, even for other public repos you own — GitHub's API rejects those fields with `Resource not accessible by integration`.

Use a **classic** personal access token: `public_repo` scope (add `repo` instead if you want private repos included) plus `read:user`.

Fine-grained PATs do not work here, even fully scoped ("All repositories" access, `Contents: read`, `Metadata: read`, `Followers: read`) — confirmed by testing: GitHub's GraphQL API still returns `Resource not accessible by personal access token` on the `stargazers` field for every repository. This is a gap in the fine-grained authorization model for this query shape (reading another user's `repositories` connection), not a configuration mistake. Classic PATs and OAuth tokens use the older scope-based model and are unaffected.

Add the token as a repo secret (e.g. `STATS_TOKEN`) and reference it in `github_token` — do not use `${{ secrets.GITHUB_TOKEN }}`.

## License

MIT
