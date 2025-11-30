export const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;

  return "#" + (
    0x1000000 +
    (Math.min(255, Math.max(0, R)) * 0x10000) +
    (Math.min(255, Math.max(0, G)) * 0x100) +
    Math.min(255, Math.max(0, B))
  ).toString(16).slice(1);
};

export const darkenColor = (color, percent) => lightenColor(color, -percent);
