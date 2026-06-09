import { Card } from "./card";
import { ContributionData } from "../fetcher";
import { Theme } from "../themes";

const FONT = "'Segoe UI', Ubuntu, Sans-Serif";

const LEVEL_COLORS: Record<string, Record<string, string>> = {
  light: {
    NONE: "#ebedf0",
    FIRST_QUARTILE: "#9be9a8",
    SECOND_QUARTILE: "#40c463",
    THIRD_QUARTILE: "#30a14e",
    FOURTH_QUARTILE: "#216e39",
  },
  dark: {
    NONE: "#161b22",
    FIRST_QUARTILE: "#0e4429",
    SECOND_QUARTILE: "#006d32",
    THIRD_QUARTILE: "#26a641",
    FOURTH_QUARTILE: "#39d353",
  },
};

export function renderContributionGraph(
  data: ContributionData,
  theme: Theme,
  _options: Record<string, unknown>,
): string {
  const isDarkBg = isDark(theme.bg_color);
  const colors = isDarkBg ? LEVEL_COLORS.dark : LEVEL_COLORS.light;
  const cellSize = 10;
  const cellGap = 2;
  const step = cellSize + cellGap;

  const weeks = data.weeks;
  const graphW = weeks.length * step + 5;
  const graphH = 7 * step + 5;
  const padL = 32;
  const padT = 20;
  const cardW = Math.max(graphW + padL + 20, 340);
  const cardH = graphH + padT + 45;

  const cells: string[] = [];
  const monthLabels: string[] = [];
  const seen = new Set<string>();

  const days = ["Mon", "", "Wed", "", "Fri", ""];
  const dayLabels = days
    .map((d, i) =>
      d
        ? `<text x="0" y="${padT + i * step + cellSize - 1}" font-size="9" font-family="${FONT}" fill="#${theme.text_color}" opacity="0.4">${d}</text>`
        : "",
    )
    .join("\n");

  for (let w = 0; w < weeks.length; w++) {
    const week = weeks[w];
    for (const day of week.contributionDays) {
      const x = padL + w * step;
      const y = padT + day.weekday * step;
      const fill = colors[day.contributionLevel] || colors.NONE;
      cells.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}"/>`);
    }
    if (week.contributionDays.length > 0) {
      const d = new Date(week.contributionDays[0].date);
      const m = d.toLocaleString("en", { month: "short" });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        monthLabels.push(`<text x="${padL + w * step}" y="10" font-size="10" font-family="${FONT}" fill="#${theme.text_color}" opacity="0.5">${m}</text>`);
      }
    }
  }

  const footerY = padT + 7 * step + 18;
  const footer = `<text x="${padL}" y="${footerY}" font-size="12" font-weight="600" font-family="${FONT}" fill="#${theme.text_color}"><tspan font-weight="700" fill="#${theme.title_color}">${data.totalContributions.toLocaleString()}</tspan> contributions in the last year</text>`;

  const card = new Card({
    width: cardW,
    height: cardH,
    colors: {
      titleColor: theme.title_color,
      textColor: theme.text_color,
      iconColor: theme.icon_color,
      bgColor: theme.bg_color,
      borderColor: theme.border_color,
    },
  });
  card.setHideTitle(true);

  return card.render(`${monthLabels.join("\n")}\n${dayLabels}\n${cells.join("\n")}\n${footer}`);
}

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}
