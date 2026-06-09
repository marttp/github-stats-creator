# GitHub Stats Creator

A GitHub Action that generates SVG stats cards from GitHub commit history and pushes them to your repository.

## Features

- **3 card types**: Stats card, Top Languages card, Contribution heatmap graph
- **10 themes**: default, dark, radical, gruvbox, tokyonight, onedark, dracula, monokai, nord, highcontrast
- **Self-contained**: No external API services required — runs entirely inside the Action
- **Auto-detects user**: Defaults to the repository owner

## Quick Start

```yaml
name: Update GitHub Stats

on:
  schedule:
    - cron: "0 0 * * *" # Runs daily at midnight UTC
  workflow_dispatch: # Allow manual trigger

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
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Then embed in your README:

```markdown
![My GitHub Stats](./gh-stats.svg)
```

## Card Types

### Stats Card (default)

Shows total commits, PRs, issues, stars, contributions, and a rank circle (S → C).

```yaml
- uses: marttp/github-stats-creator@v1
  with:
    card_type: stats
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Top Languages Card

Shows your most used languages with percentage bars.

```yaml
- uses: marttp/github-stats-creator@v1
  with:
    card_type: top-langs
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Contribution Graph

Shows a GitHub-style contribution heatmap calendar.

```yaml
- uses: marttp/github-stats-creator@v1
  with:
    card_type: contribution-graph
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Generate Multiple Cards

You can generate multiple card types in a single workflow:

```yaml
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
          card_type: stats
          theme: dark
          output_path: profile/stats.svg
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate top languages card
        uses: marttp/github-stats-creator@v1
        with:
          card_type: top-langs
          theme: dark
          output_path: profile/top-langs.svg
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate contribution graph
        uses: marttp/github-stats-creator@v1
        with:
          card_type: contribution-graph
          theme: dark
          output_path: profile/contributions.svg
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github_user_name` | GitHub username to generate stats for. Defaults to the repository owner. | No | `""` (auto-detected) |
| `github_token` | GitHub token (PAT or `GITHUB_TOKEN`). Needs `read:user` scope. | Yes | `${{ github.token }}` |
| `card_type` | Card type: `stats`, `top-langs`, `contribution-graph` | No | `stats` |
| `theme` | Theme preset | No | `default` |
| `output_path` | Output file path for the SVG | No | `gh-stats.svg` |
| `commit_message` | Git commit message when pushing the SVG | No | `Update GitHub stats SVG [skip ci]` |
| `show_icons` | Show icons on the stats card | No | `true` |
| `hide_rank` | Hide the rank circle on the stats card | No | `false` |
| `include_all_commits` | Include all-time commits (may be slower) | No | `false` |
| `langs_count` | Number of languages on top-langs card | No | `5` |

## Outputs

| Output | Description |
|--------|-------------|
| `svg_path` | Path to the generated SVG file |

## Themes

Available themes: `default`, `dark`, `radical`, `gruvbox`, `tokyonight`, `onedark`, `dracula`, `monokai`, `nord`, `highcontrast`

## Permissions

The workflow requires `contents: write` permission to commit and push the SVG file.

## Token Scopes

- For **public** repos: `GITHUB_TOKEN` (default) works for stats and contribution graph
- For **private** repo stats or `include_all_commits`: use a PAT with `repo` and `read:user` scopes

## License

MIT
