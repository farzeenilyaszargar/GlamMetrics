import type { StyleReport } from "./report";
export async function saveStoryCard(report: StyleReport, occasion: string) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export isn't supported in this browser.");
  const serif =
    getComputedStyle(document.body).getPropertyValue("--font-serif").trim() ||
    "Georgia";
  const sans =
    getComputedStyle(document.body).getPropertyValue("--font-sans").trim() ||
    "sans-serif";
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = "#343434";
  ctx.lineWidth = 2;
  ctx.strokeRect(54, 54, 972, 1812);
  ctx.textAlign = "center";
  ctx.fillStyle = "#D5FF70";
  ctx.font = `600 58px ${serif}`;
  ctx.fillText("glammetrics", 540, 165);
  ctx.font = `21px ${sans}`;
  ctx.fillText(occasion, 540, 252);
  const wrap = (
    text: string,
    x: number,
    y: number,
    width: number,
    lineHeight: number,
    maxLines: number,
  ) => {
    const words = text.split(/\s+/);
    let line = "",
      count = 0;
    for (let i = 0; i < words.length; i++) {
      const next = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(next).width > width && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        count++;
        if (count === maxLines - 1) {
          let rest = words.slice(i).join(" ");
          while (ctx.measureText(rest).width > width && rest.length > 0)
            rest = rest.slice(0, -1);
          ctx.fillText(rest + (i < words.length - 1 ? "…" : ""), x, y);
          return y + lineHeight;
        }
        line = words[i];
      } else line = next;
    }
    ctx.fillText(line, x, y);
    return y + lineHeight;
  };
  ctx.fillStyle = "#D5FF70";
  ctx.beginPath();
  ctx.arc(540, 510, 175, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111111";
  ctx.font = `154px ${serif}`;
  ctx.fillText(String(report.score), 540, 540);
  ctx.font = `19px ${sans}`;
  ctx.fillText("OUTFIT STYLING / 100", 540, 601);
  ctx.fillStyle = "#F5F4EF";
  ctx.font = `66px ${serif}`;
  wrap(report.title, 540, 805, 850, 74, 3);
  const colours = report.palette;
  const start = 130,
    gap = 18,
    width = (820 - gap * (colours.length - 1)) / colours.length;
  colours.forEach((c, i) => {
    ctx.fillStyle = c.hex;
    ctx.fillRect(start + i * (width + gap), 1075, width, 140);
  });
  ctx.fillStyle = "#EFB8D3";
  ctx.font = `20px ${sans}`;
  ctx.fillText("My colour palette", 540, 1268);
  ctx.font = `29px ${sans}`;
  ctx.fillStyle = "#C9C6C0";
  wrap(report.suggestions[0] || report.summary, 540, 1390, 790, 47, 4);
  ctx.fillStyle = "#D5FF70";
  ctx.font = `40px ${serif}`;
  ctx.fillText("My style. Turned up.", 540, 1680);
  ctx.font = `22px ${sans}`;
  ctx.fillText("Discover your own edit at " + window.location.host, 540, 1753);
  ctx.font = `17px ${sans}`;
  ctx.fillStyle = "#AAA9A4";
  ctx.fillText(
    "A subjective AI outfit review. Your body is never a score.",
    540,
    1810,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not export the story card.");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "glammetrics-style-story.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
