import { Card } from "./card";
import { StatsData } from "../fetcher";
import { calculateRank, Rank } from "../rank";
import { icons } from "../icons";
import { Theme } from "../themes";

function kFormatter(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function encodeHTML(str: string): string {
  return str.replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
    return "&#" + i.charCodeAt(0) + ";";
  });
}

const STAT_ITEMS = [
  { key: "stars", icon: icons.star, label: "Total Stars" },
  { key: "commits", icon: icons.commits, label: "Total Commits" },
  { key: "prs", icon: icons.prs, label: "Total PRs" },
  { key: "issues", icon: icons.issues, label: "Total Issues" },
  { key: "contribs", icon: icons.contribs, label: "Contributed to" },
] as const;

function statRow(
  icon: string,
  label: string,
  value: string,
  index: number,
  showIcons: boolean,
  iconColor: string,
  valueX: number,
): string {
  const delay = (index + 1) * 150;
  const y = index * 25;

  const iconSvg = showIcons
    ? `<svg class="stat-icon" viewBox="0 0 16 16" width="16" height="16" fill="#${iconColor}">
        ${icon}
      </svg>`
    : "";

  const labelX = showIcons ? 24 : 0;

  return `<g class="stat-row" style="animation-delay: ${delay}ms" transform="translate(25, ${y})">
      ${iconSvg}
      <text class="stat-label" x="${labelX}" y="12.5">${label}:</text>
      <text class="stat-value" x="${valueX}" y="12.5">${value}</text>
    </g>`;
}

export function renderStatsCard(
  stats: StatsData,
  theme: Theme,
  options: {
    showIcons: boolean;
    hideRank: boolean;
    includeAllCommits: boolean;
  },
): string {
  const rank: Rank = calculateRank({
    allCommits: options.includeAllCommits,
    commits: stats.totalCommits,
    prs: stats.totalPRs,
    issues: stats.totalIssues,
    reviews: stats.totalReviews,
    repos: stats.repos,
    stars: stats.totalStars,
    followers: stats.followers,
  });

  const values: Record<string, number> = {
    stars: stats.totalStars,
    commits: stats.totalCommits,
    prs: stats.totalPRs,
    issues: stats.totalIssues,
    contribs: stats.contributedTo,
  };

  const showRank = !options.hideRank;
  const cardWidth = showRank ? 450 : 340;
  const lineHeight = 25;
  const statCount = STAT_ITEMS.length;
  const bodyHeight = statCount * lineHeight;
  const cardHeight = Math.max(bodyHeight + 75, 150);
  const progress = 100 - rank.percentile;
  const circumference = 2 * Math.PI * 40;
  const progressOffset = ((100 - progress) / 100) * circumference;
  const valueX = options.showIcons ? 155 : 130;

  const css = `
    .stat-label {
      font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
    }
    .stat-value {
      font: 700 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
    }
    .stat-icon {
      y: -1;
    }
    .stat-row {
      opacity: 0;
      animation: slideUp 0.4s ease-in-out forwards;
    }
    .rank-circle-bg {
      stroke: #${theme.ring_color};
      fill: none;
      stroke-width: 6;
      opacity: 0.15;
    }
    .rank-circle {
      stroke: #${theme.ring_color};
      stroke-dasharray: ${circumference};
      stroke-dashoffset: ${circumference};
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      transform-origin: 50% 50%;
      transform: rotate(-90deg);
      --progress-offset: ${progressOffset};
      animation: rankAnim 1s 0.5s ease-in-out forwards;
    }
    .rank-label {
      font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
      opacity: 0.6;
    }
    .rank-level {
      font: 800 28px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
      animation: scaleIn 0.4s ease-in-out forwards;
    }
  `;

  const card = new Card({
    width: cardWidth,
    height: cardHeight,
    colors: {
      titleColor: theme.title_color,
      textColor: theme.text_color,
      iconColor: theme.icon_color,
      bgColor: theme.bg_color,
      borderColor: theme.border_color,
    },
    title: `${encodeHTML(stats.name)}'s GitHub Stats`,
  });
  card.setCSS(css);

  const statRows = STAT_ITEMS.map((item, i) =>
    statRow(
      item.icon,
      item.label,
      kFormatter(values[item.key]),
      i,
      options.showIcons,
      theme.icon_color,
      valueX,
    ),
  ).join("\n");

  const rankCircle = showRank
    ? `<g transform="translate(${cardWidth - 80}, ${(cardHeight - 100) / 2})">
        <circle class="rank-circle-bg" cx="40" cy="40" r="40" />
        <circle class="rank-circle" cx="40" cy="40" r="40" />
        <text class="rank-label" x="40" y="28" text-anchor="middle">RANK</text>
        <text class="rank-level" x="40" y="56" text-anchor="middle">${rank.level}</text>
      </g>`
    : "";

  return card.render(`
    ${rankCircle}
    <g>
      ${statRows}
    </g>
  `);
}
