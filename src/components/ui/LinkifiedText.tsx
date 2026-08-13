// Citation/reference text may embed a source link (DOI, Google Scholar,
// proof link, etc.) right in the text. Pull the URL out and render it as
// its own clickable line below the text instead of inline plain text.
const URL_RE = /(https?:\/\/[^\s]+)/;

export function extractUrl(text: string): { rest: string; url: string | null } {
  const match = URL_RE.exec(text);
  if (!match) return { rest: text, url: null };

  const url = match[1].replace(/[.,;)\]]+$/, '');
  const rest = (text.slice(0, match.index) + text.slice(match.index + url.length))
    .replace(/\s+/g, ' ')
    .trim();

  return { rest, url };
}

export function LinkifiedText({ text }: { text: string }) {
  const { rest, url } = extractUrl(text);
  if (!url) return <>{text}</>;

  return (
    <>
      {rest}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block text-accent underline break-all hover:text-accent/80 transition-colors"
      >
        {url}
      </a>
    </>
  );
}

export function ListItem({ text }: { text: string }) {
  return (
    <li>
      <LinkifiedText text={text} />
    </li>
  );
}

// Same "text + link on its own line below" look as LinkifiedText, but for
// callers that already have a dedicated link field instead of an embedded URL.
export function TextWithLink({ text, link }: { text: string; link?: string | null }) {
  return (
    <>
      {text}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-accent underline break-all hover:text-accent/80 transition-colors"
        >
          {link}
        </a>
      )}
    </>
  );
}
