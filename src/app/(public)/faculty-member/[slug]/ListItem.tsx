// A list item may embed a source link (DOI, Google Scholar, etc.) right in
// the citation text. Pull the URL out and render it as its own clickable
// line below the citation instead of inline plain text.
const URL_RE = /(https?:\/\/[^\s]+)/;

export function ListItem({ text }: { text: string }) {
  const match = URL_RE.exec(text);
  if (!match) return <li>{text}</li>;

  const url = match[1].replace(/[.,;)\]]+$/, '');
  const rest = (text.slice(0, match.index) + text.slice(match.index + url.length))
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <li>
      {rest}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block text-accent underline break-all hover:text-accent/80 transition-colors"
      >
        {url}
      </a>
    </li>
  );
}
