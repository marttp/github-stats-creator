import { Card } from "./card";
import { LangData } from "../fetcher";
import { Theme } from "../themes";

export function renderTopLangsCard(
  data: LangData,
  theme: Theme,
  options: {
    langsCount: number;
  },
): string {
  const langs = data.languages.slice(0, options.langsCount);
  const totalSize = langs.reduce((s, l) => s + l.size, 0);

  const cardWidth = 400;
  const barHeight = 8;
  const lineHeight = 35;
  const cardHeight = 45 + langs.length * lineHeight + 40;

  const css = `
    .lang-name {
      font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
    }
    .lang-percent {
      font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #${theme.text_color};
    }
    .stagger {
      opacity: 0;
      animation: fadeIn 0.3s ease-in-out forwards;
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
    title: "Most Used Languages",
  });

  card.setCSS(css);

  const langRows = langs
    .map((lang, i) => {
      const percent = totalSize > 0 ? ((lang.size / totalSize) * 100).toFixed(1) : "0";
      const y = i * lineHeight;
      const barWidth = totalSize > 0 ? (lang.size / totalSize) * (cardWidth - 50) : 0;

      return `
        <g class="stagger" style="animation-delay: ${(i + 3) * 150}ms" transform="translate(25, ${y})">
          <circle cx="5" cy="8" r="5" fill="${lang.color}" />
          <text class="lang-name" x="18" y="12">${lang.name}</text>
          <text class="lang-percent" x="${cardWidth - 75}" y="12">${percent}%</text>
        </g>
        <g transform="translate(25, ${y + 18})">
          <rect width="${cardWidth - 50}" height="${barHeight}" rx="5" fill="#${theme.border_color}" />
          <rect width="${barWidth}" height="${barHeight}" rx="5" fill="${lang.color}" />
        </g>`;
    })
    .join("\n");

  return card.render(`
    <svg x="0" y="0">
      ${langRows}
    </svg>
  `);
}
