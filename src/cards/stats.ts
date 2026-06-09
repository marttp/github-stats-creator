import { StatsData } from "../fetcher";
import { icons } from "../icons";
import { Theme } from "../themes";

const FONT = "'Segoe UI', Ubuntu, Sans-Serif";
const MONO = "'SF Mono', 'Cascadia Code', 'Consolas', monospace";

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

const ROW_H = 24;
const CHAR_W = 8.4;

interface Metric {
  icon: string;
  value: number;
  label: string;
}

function metricRow(
  m: Metric,
  x: number,
  y: number,
  iconColor: string,
  textColor: string,
): string {
  const icon = `<svg x="${x}" y="${y + 1}" width="13" height="13" viewBox="0 0 16 16" fill="#${iconColor}" opacity="0.6">${m.icon}</svg>`;
  const numX = x + 18;
  const formatted = kFormatter(m.value);
  const labelX = numX + Math.ceil(formatted.length * CHAR_W) + 6;
  return `${icon}
<text x="${numX}" y="${y + 12}" font-size="14" font-weight="700" font-family="${MONO}" fill="#${textColor}">${formatted}</text>
<text x="${labelX}" y="${y + 12}" font-size="12" font-family="${FONT}" fill="#${textColor}" opacity="0.5">${m.label}</text>`;
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
  const impactMetrics: Metric[] = [
    { icon: icons.star, value: stats.totalStars, label: "stars" },
    { icon: icons.contribs, value: stats.contributedTo, label: "contributions" },
  ];

  const activityMetrics: Metric[] = [
    { icon: icons.commits, value: stats.totalCommits, label: "commits" },
    { icon: icons.prs, value: stats.totalPRs, label: "pull requests" },
    { icon: icons.issues, value: stats.totalIssues, label: "issues" },
  ];

  const p = 24;
  const cardWidth = 440;

  const nameY = p + 16;
  const loginY = p + 32;
  const sepY = loginY + 8;
  const sectionLabelY = sepY + 16;
  const firstRowY = sectionLabelY + 12;

  const impactX = p;
  const activityX = Math.floor(cardWidth / 2) + 10;

  const maxRows = Math.max(impactMetrics.length, activityMetrics.length);
  const bodyH = maxRows * ROW_H;
  const cardHeight = firstRowY + bodyH + p;

  const sectionStyle = `font-size="9" font-weight="700" font-family="${FONT}" fill="#${theme.text_color}" opacity="0.3" letter-spacing="1.5"`;

  const impactRows = impactMetrics
    .map((m, i) =>
      metricRow(m, impactX, firstRowY + i * ROW_H, theme.icon_color, theme.text_color),
    )
    .join("\n");

  const activityRows = activityMetrics
    .map((m, i) =>
      metricRow(m, activityX, firstRowY + i * ROW_H, theme.icon_color, theme.text_color),
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" role="img">
  <rect x="0.5" y="0.5" width="${cardWidth - 1}" height="99%" rx="4.5" fill="#${theme.bg_color}" stroke="#${theme.border_color}"/>
  <text x="${p}" y="${nameY}" font-size="16" font-weight="600" font-family="${FONT}" fill="#${theme.title_color}">${encodeHTML(stats.name)}</text>
  <text x="${p}" y="${loginY}" font-size="11" font-family="${FONT}" fill="#${theme.text_color}" opacity="0.4">@${stats.login}</text>
  <line x1="${p}" y1="${sepY}" x2="${cardWidth - p}" y2="${sepY}" stroke="#${theme.text_color}" stroke-width="0.5" opacity="0.1"/>
  <text x="${impactX}" y="${sectionLabelY}" ${sectionStyle}>IMPACT</text>
  <text x="${activityX}" y="${sectionLabelY}" ${sectionStyle}>ACTIVITY</text>
  ${impactRows}
  ${activityRows}
</svg>`;
}
