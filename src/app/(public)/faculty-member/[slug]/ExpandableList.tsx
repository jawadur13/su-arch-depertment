'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ListItem } from '@/components/ui/LinkifiedText';

const VISIBLE_COUNT = 10;

export default function ExpandableList({ items }: { items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > VISIBLE_COUNT;
  const shown = expanded ? items : items.slice(0, VISIBLE_COUNT);

  return (
    <div>
      <ul className="list-disc list-outside pl-5 space-y-2">
        {shown.map((item, i) => (
          <ListItem key={i} text={item} />
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
        >
          {expanded ? 'Show less' : `Show ${items.length - VISIBLE_COUNT} more`}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  );
}
