export interface CardColors {
  titleColor: string;
  textColor: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const FONT = "'Segoe UI', Ubuntu, Sans-Serif";

export class Card {
  width: number;
  height: number;
  borderRadius: number;
  colors: CardColors;
  title: string;
  hideBorder: boolean;
  hideTitle: boolean;
  paddingX: number;
  paddingY: number;

  constructor(opts: {
    width?: number;
    height?: number;
    borderRadius?: number;
    colors: CardColors;
    title?: string;
  }) {
    this.width = opts.width || 450;
    this.height = opts.height || 200;
    this.borderRadius = opts.borderRadius || 4.5;
    this.colors = opts.colors;
    this.title = opts.title || "";
    this.hideBorder = false;
    this.hideTitle = false;
    this.paddingX = 25;
    this.paddingY = 38;
  }

  setHideBorder(v: boolean) {
    this.hideBorder = v;
  }

  setHideTitle(v: boolean) {
    this.hideTitle = v;
    if (v) this.paddingY = 15;
  }

  render(body: string): string {
    const title = this.hideTitle
      ? ""
      : `<text x="${this.paddingX}" y="${this.paddingY}" font-weight="600" font-size="18" font-family="${FONT}" fill="#${this.colors.titleColor}">${this.title}</text>`;

    const bodyY = this.hideTitle ? this.paddingY - 10 : this.paddingY + 15;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" role="img">
  <rect x="0.5" y="0.5" width="${this.width - 1}" height="99%" rx="${this.borderRadius}" fill="#${this.colors.bgColor}" stroke="#${this.colors.borderColor}" stroke-opacity="${this.hideBorder ? 0 : 1}"/>
  ${title}
  <g transform="translate(${this.paddingX}, ${bodyY})">
    ${body}
  </g>
</svg>`;
  }
}
