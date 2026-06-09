import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fetchStats, fetchTopLangs, fetchContributions } from "./fetcher";
import { getTheme } from "./themes";
import { renderStatsCard } from "./cards/stats";
import { renderTopLangsCard } from "./cards/top-langs";
import { renderContributionGraph } from "./cards/contribution-graph";

async function run(): Promise<void> {
  try {
    const username =
      core.getInput("github_user_name") ||
      process.env.GITHUB_REPOSITORY?.split("/")[0] ||
      "";
    if (!username) {
      throw new Error(
        "github_user_name is required. Set it or run from a GitHub Actions workflow.",
      );
    }
    const token = core.getInput("github_token", { required: true });
    const cardType = core.getInput("card_type") || "stats";
    const themeName = core.getInput("theme") || "default";
    const outputPath = core.getInput("output_path") || "gh-stats.svg";
    const commitMessage =
      core.getInput("commit_message") || "Update GitHub stats SVG [skip ci]";
    const showIcons = core.getInput("show_icons") !== "false";
    const hideRank = core.getInput("hide_rank") === "true";
    const includeAllCommits = core.getInput("include_all_commits") === "true";
    const langsCount = parseInt(core.getInput("langs_count") || "5", 10);

    core.info(`Generating ${cardType} card for user: ${username}`);
    core.info(`Theme: ${themeName}`);

    const theme = getTheme(themeName);
    let svg: string;

    switch (cardType) {
      case "stats": {
        core.info("Fetching stats data...");
        const stats = await fetchStats(username, token, includeAllCommits);
        core.info(
          `Stats fetched: ${stats.totalCommits} commits, ${stats.totalStars} stars`,
        );
        svg = renderStatsCard(stats, theme, {
          showIcons,
          hideRank,
          includeAllCommits,
        });
        break;
      }
      case "top-langs": {
        core.info("Fetching language data...");
        const langs = await fetchTopLangs(username, token);
        core.info(`Languages fetched: ${langs.languages.length} languages`);
        svg = renderTopLangsCard(langs, theme, { langsCount });
        break;
      }
      case "contribution-graph": {
        core.info("Fetching contribution data...");
        const contributions = await fetchContributions(username, token);
        core.info(
          `Contributions fetched: ${contributions.totalContributions} total`,
        );
        svg = renderContributionGraph(contributions, theme, {});
        break;
      }
      default:
        throw new Error(
          `Unknown card_type: "${cardType}". Supported: stats, top-langs, contribution-graph`,
        );
    }

    const fullPath = path.resolve(outputPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, svg);
    core.info(`SVG written to: ${fullPath}`);
    core.setOutput("svg_path", outputPath);

    gitCommitAndPush(outputPath, commitMessage);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unexpected error occurred");
    }
  }
}

function gitCommitAndPush(filePath: string, message: string): void {
  try {
    execSync(`git config user.name "github-actions[bot]"`);
    execSync(
      `git config user.email "41898282+github-actions[bot]@users.noreply.github.com"`,
    );
    execSync(`git pull --rebase origin ${process.env.GITHUB_REF_NAME || "main"} 2>&1 || true`);
    execSync(`git add "${filePath}"`);
    const result = execSync(`git commit -m "${message}" 2>&1 || true`, {
      encoding: "utf-8",
    });
    core.info(`Git commit result: ${result.trim()}`);
    execSync(`git push`);
    core.info("SVG pushed to repository");
  } catch (error) {
    if (error instanceof Error) {
      core.warning(`Git operations failed: ${error.message}`);
    }
  }
}

run();
