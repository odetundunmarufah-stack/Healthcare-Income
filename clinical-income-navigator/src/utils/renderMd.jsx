export const renderMd = (text) => {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    if (line.startsWith("### "))
      return (
        <h4
          key={i}
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#1a3a3a",
            margin: "16px 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {line.slice(4)}
        </h4>
      );
    if (line.startsWith("- ") || line.startsWith("• ")) {
      const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return (
        <li
          key={i}
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: "#2a3a3a",
            marginLeft: 18,
            marginBottom: 5,
            listStyle: "disc",
          }}
        >
          {parts.map((p, j) =>
            j % 2 === 1 ? (
              <strong key={j} style={{ color: "#1a3a3a" }}>
                {p}
              </strong>
            ) : (
              p
            )
          )}
        </li>
      );
    }
    if (/^\d+\./.test(line))
      return (
        <li
          key={i}
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: "#2a3a3a",
            marginLeft: 18,
            marginBottom: 5,
            listStyle: "decimal",
          }}
        >
          {line.replace(/^\d+\.\s*/, "")}
        </li>
      );
    const parts = line.split(/\*\*(.*?)\*\*/g);
    if (parts.length > 1)
      return (
        <p
          key={i}
          style={{ fontSize: 14, lineHeight: 1.85, color: "#2a3a3a", marginBottom: 8 }}
        >
          {parts.map((p, j) =>
            j % 2 === 1 ? (
              <strong key={j} style={{ color: "#1a3a3a" }}>
                {p}
              </strong>
            ) : (
              p
            )
          )}
        </p>
      );
    return (
      <p key={i} style={{ fontSize: 14, lineHeight: 1.85, color: "#2a3a3a", marginBottom: 8 }}>
        {line}
      </p>
    );
  });
};
