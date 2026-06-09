import { Card } from "./card";
import { StatsData } from "../fetcher";
import { calculateRank } from "../rank";
import { icons } from "../icons";
import { Theme } from "../themes";

const FONT = "'Segoe UI', Ubuntu, Sans-Serif";

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

const ROW_H = 25;

export function renderStatsCard(
  stats: StatsData,
  theme: Theme,
  options: {
    showIcons: boolean;
    hideRank: boolean;
    includeAllCommits: boolean;
  },
): string {
  const rank = calculateRank({
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

  const iconX = 0;
  const labelX = options.showIcons ? 24 : 0;
  const valueX = labelX + 120;
  const contentW = valueX + 70;

  const showRank = !options.hideRank;
  const rankR = 38;
  const rankArea = showRank ? rankR * 2 + 30 : 0;
  const cardWidth = Math.max(contentW + rankArea + 25, 320);
  const bodyH = STAT_ITEMS.length * ROW_H;
  const cardHeight = Math.max(bodyH + 60, 150);

  const rows = STAT_ITEMS.map((item, i) => {
    const y = i * ROW_H;
    const icon = options.showIcons
      ? `<svg x="${iconX}" y="0" width="16" height="16" viewBox="0 0 16 16" fill="#${theme.icon_color}">${icons[item.icon as keyof typeof icons]}</svg>`
      : "";
    return `${icon}<text x="${labelX}" y="${y + 13}" font-size="14" font-family="${FONT}" fill="#${theme.text_color}">${item.label}:</text><text x="${valueX}" y="${y + 13}" font-size="14" font-weight="700" font-family="${FONT}" fill="#${theme.text_color}">${kFormatter(values[item.key])}</text>`;
  }).join("\n");

  const rankSvg = showRank
    ? (() => {
        const cx = cardWidth - 25 - rankR - 5;
        const cy = cardHeight / 2 - 10;
        const circ = 2 * Math.PI * rankR;
        const filled = ((100 - rank.percentile) / 100) * circ;
        return `<circle cx="${cx}" cy="${cy}" r="${rankR}" fill="none" stroke="#${theme.border_color}" stroke-width="6" opacity="0.4"/>
<circle cx="${cx}" cy="${cy}" r="${rankR}" fill="none" stroke="#${theme.ring_color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ - filled}" transform="rotate(-90 ${cx} ${cy})"/>
<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="11" font-weight="600" font-family="${FONT}" fill="#${theme.text_color}" opacity="0.6">RANK</text>
<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="22" font-weight="800" font-family="${FONT}" fill="#${theme.text_color}">${rank.level}</text>`;
      })()
    : "";

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

  return card.render(`${rows}\n${rankSvg}`);
}
