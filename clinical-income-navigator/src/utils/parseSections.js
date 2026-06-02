export const parseSections = (text) => {
  if (!text) return [];
  const out = [];
  let title = null;
  let buf = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      if (title) out.push({ title, content: buf.join("\n").trim() });
      title = line.slice(3).trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (title) out.push({ title, content: buf.join("\n").trim() });
  return out;
};
