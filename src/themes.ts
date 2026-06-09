export interface Theme {
  title_color: string;
  text_color: string;
  icon_color: string;
  bg_color: string;
  border_color: string;
  ring_color: string;
}

const themes: Record<string, Theme> = {
  default: {
    title_color: "2f80ed",
    text_color: "434d58",
    icon_color: "4c71f2",
    bg_color: "fffefe",
    border_color: "e4e2e2",
    ring_color: "4c71f2",
  },
  dark: {
    title_color: "58a6ff",
    text_color: "c9d1d9",
    icon_color: "58a6ff",
    bg_color: "0d1117",
    border_color: "30363d",
    ring_color: "58a6ff",
  },
  radical: {
    title_color: "fe428e",
    text_color: "a9fef7",
    icon_color: "f8d847",
    bg_color: "141321",
    border_color: "e4e2e2",
    ring_color: "fe428e",
  },
  gruvbox: {
    title_color: "fabd2f",
    text_color: "8ec07c",
    icon_color: "fe8019",
    bg_color: "282828",
    border_color: "504945",
    ring_color: "fabd2f",
  },
  tokyonight: {
    title_color: "70a5fd",
    text_color: "a0a8cd",
    icon_color: "bf91f3",
    bg_color: "1a1b27",
    border_color: "1a1b27",
    ring_color: "70a5fd",
  },
  onedark: {
    title_color: "e4bf7a",
    text_color: "df6d74",
    icon_color: "61afef",
    bg_color: "282c34",
    border_color: "282c34",
    ring_color: "e4bf7a",
  },
  dracula: {
    title_color: "ff6e96",
    text_color: "f8f8f2",
    icon_color: "79dafa",
    bg_color: "282a36",
    border_color: "282a36",
    ring_color: "ff6e96",
  },
  monokai: {
    title_color: "f0883e",
    text_color: "a7ec21",
    icon_color: "ae81ff",
    bg_color: "272822",
    border_color: "272822",
    ring_color: "f0883e",
  },
  nord: {
    title_color: "81a1c1",
    text_color: "d8dee9",
    icon_color: "88c0d0",
    bg_color: "2e3440",
    border_color: "3b4252",
    ring_color: "81a1c1",
  },
  highcontrast: {
    title_color: "b7f74a",
    text_color: "ffffff",
    icon_color: "ffffff",
    bg_color: "000000",
    border_color: "b7f74a",
    ring_color: "b7f74a",
  },
};

export function getTheme(name: string): Theme {
  return themes[name] || themes.default;
}
