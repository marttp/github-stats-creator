import { Card } from "./card";
import { StatsData } from "../fetcher";
import { calculateRank, Rank } from "../rank";
import { icons } from "../icons";
import { Theme } from "../themes";

function kFormatter(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

function createTextNode(opts: {
  icon: string;
  label: string;
  value: number | string;
  index: number;
  showIcons: boolean;
  textColor: string;
  iconColor: string;
}): string {
  const stagger = (opts.index + 3) * 150;
  const displayValue = typeof opts.value === "number" ? kFormatter(opts.value) : opts.value;
  const iconSvg = opts.showIcons
    ? `<svg data-testid="icon" class="icon" viewBox="0 0 16 16" width="16" height="16" fill="#${opts.iconColor}">
        ${opts.icon}
      </svg>`
    : "";
  const labelX = opts.showIcons ? 'x="25"' : "";

  return `
    <g class="stagger" style="animation-delay: ${stagger}ms" transform="translate(25, 0)">
      ${iconSvg}
      <text class="stat bold" ${labelX} y="12.5">${opts.label}:</text>
      <text class="stat bold" x="${opts.showIcons ? 140 : 120}" y="12.5">${displayValue}</text>
    </g>`;
}

function circleProgress(value: number): number {
  const radius = 40;
  const c = Math.PI * (radius * 2);
  const v = Math.max(0, Math.min(100, value));
  return ((100 - v) / 100) * c;
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

  const lineHeight = 25;
  const statItems = [
    {
      icon: icons.star,
      label: "Total Stars",
      value: stats.totalStars,
    },
    {
      icon: icons.commits,
      label: "Total Commits",
      value: stats.totalCommits,
    },
    {
      icon: icons.prs,
      label: "Total PRs",
      value: stats.totalPRs,
    },
    {
      icon: icons.issues,
      label: "Total Issues",
      value: stats.totalIssues,
    },
    {
      icon: icons.contribs,
      label: "Contributed to",
      value: stats.contributedTo,
    },
  ];

  const textNodes = statItems
    .map((item, i) =>
      createTextNode({
        ...item,
        index: i,
        showIcons: options.showIcons,
        textColor: theme.text_color,
        iconColor: theme.icon_color,
      }),
    )
    .join("\n");

  const cardWidth = options.hideRank ? 340 : 450;
  let cardHeight = Math.max(45 + (statItems.length + 1) * lineHeight, 150);
  const progress = 100 - rank.percentile;

  const css = `
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
    }
    .stagger {
      opacity: 0;
      animation: fadeIn 0.3s ease-in-out forwards;
    }
    .bold { font-weight: 700; }
    .icon { fill: #${theme.icon_color}; display: ${options.showIcons ? "block" : "none"}; }
    .rank-circle-rim {
      stroke: #${theme.ring_color};
      fill: none;
      stroke-width: 6;
      opacity: 0.2;
    }
    .rank-circle {
      stroke: #${theme.ring_color};
      stroke-dasharray: 250;
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: -10px 8px;
      transform: rotate(-90deg);
      animation: rankAnim 1s forwards ease-in-out;
    }
    .rank-text {
      font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
      animation: scaleIn 0.3s ease-in-out forwards;
    }
    @keyframes rankAnim {
      from { stroke-dashoffset: ${circleProgress(0)}; }
      to { stroke-dashoffset: ${circleProgress(progress)}; }
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
    title: `${stats.name}'s GitHub Stats`,
  });

  card.setCSS(css);

  const rankCircle = options.hideRank
    ? ""
    : `<g transform="translate(${cardWidth - 70}, ${cardHeight / 2 - 50})">
        <circle class="rank-circle-rim" cx="-10" cy="8" r="40" />
        <circle class="rank-circle" cx="-10" cy="8" r="40" />
        <text class="rank-text" x="-5" y="15" text-anchor="middle">${rank.level}</text>
      </g>`;

  return card.render(`
    ${rankCircle}
    <svg x="0" y="0">
      ${textNodes}
    </svg>
  `);
}
