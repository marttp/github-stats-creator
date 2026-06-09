import { Card } from "./card";
import { ContributionData } from "../fetcher";
import { Theme } from "../themes";

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
  const cellSize = 11;
  const cellGap = 3;
  const cellStep = cellSize + cellGap;

  const weeks = data.weeks;
  const totalWeeks = weeks.length;
  const graphWidth = totalWeeks * cellStep + 10;
  const graphHeight = 7 * cellStep + 10;

  const labelHeight = 20;
  const cardWidth = Math.max(graphWidth + 50, 320);
  const cardHeight = graphHeight + labelHeight + 70;

  const css = `
    .cell {
      rx: 2;
    }
    .month-label {
      font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
      opacity: 0.6;
    }
    .day-label {
      font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
      opacity: 0.5;
    }
    .total-label {
      font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
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
    title: "Contribution Graph",
  });

  card.setCSS(css);

  const cells: string[] = [];
  const monthLabels: string[] = [];
  const seenMonths = new Set<string>();

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];
  const dayLabelSvg = dayLabels
    .map((label, i) => {
      if (!label) return "";
      return `<text class="day-label" x="0" y="${25 + i * cellStep + cellSize / 2 + 3}">${label}</text>`;
    })
    .join("\n");

  for (let w = 0; w < weeks.length; w++) {
    const week = weeks[w];
    for (const day of week.contributionDays) {
      const x = 30 + w * cellStep;
      const y = 20 + day.weekday * cellStep;
      const color = colors[day.contributionLevel] || colors.NONE;

      cells.push(`<rect class="cell" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" />`);
    }

    if (week.contributionDays.length > 0) {
      const firstDay = week.contributionDays[0];
      const date = new Date(firstDay.date);
      const monthName = date.toLocaleString("en", { month: "short" });
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        monthLabels.push(
          `<text class="month-label" x="${30 + w * cellStep}" y="10">${monthName}</text>`,
        );
      }
    }
  }

  const totalText = `<text class="total-label" x="25" y="${cardHeight - 15}">${data.totalContributions.toLocaleString()} contributions in the last year</text>`;

  return card.render(`
    <svg x="0" y="0">
      ${monthLabels.join("\n")}
      ${dayLabelSvg}
      ${cells.join("\n")}
      ${totalText}
    </svg>
  `);
}

function isDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
