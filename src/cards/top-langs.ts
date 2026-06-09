import { Card } from "./card";
import { LangData } from "../fetcher";
import { Theme } from "../themes";

const FONT = "'Segoe UI', Ubuntu, Sans-Serif";

export function renderTopLangsCard(
  data: LangData,
  theme: Theme,
  options: { langsCount: number },
): string {
  const langs = data.languages.slice(0, options.langsCount);
  const totalSize = langs.reduce((s, l) => s + l.size, 0);

  const cardWidth = 380;
  const barH = 8;
  const rowH = 36;
  const cardHeight = 55 + langs.length * rowH;
  const barW = cardWidth - 50;

  const rows = langs
    .map((lang, i) => {
      const pct = totalSize > 0 ? ((lang.size / totalSize) * 100).toFixed(1) : "0.0";
      const fillW = totalSize > 0 ? (lang.size / totalSize) * barW : 0;
      const y = i * rowH;
      const barY = y + 22;

      return `<circle cx="8" cy="${y + 10}" r="5" fill="${lang.color}"/>
<text x="20" y="${y + 14}" font-size="13" font-weight="600" font-family="${FONT}" fill="#${theme.text_color}">${lang.name}</text>
<text x="${barW - 10}" y="${y + 14}" font-size="13" font-weight="600" font-family="${FONT}" fill="#${theme.text_color}" text-anchor="end">${pct}%</text>
<rect x="0" y="${barY}" width="${barW}" height="${barH}" rx="4" fill="#${theme.border_color}"/>
<rect x="0" y="${barY}" width="${fillW}" height="${barH}" rx="4" fill="${lang.color}"/>`;
    })
    .join("\n");

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

  return card.render(rows);
}
