import Image from 'next/image';
import { blurBackdropUrl } from '@/lib/cloudinary-render';

type Props = {
  src: string;
  alt: string;
  /** Passed straight to next/image on the foreground layer. */
  sizes: string;
  /** Extra classes on the foreground image (hover transforms, etc.). */
  className?: string;
  priority?: boolean;
};

/**
 * Event artwork arrives in two incompatible shapes: landscape
 * photographs, and portrait posters/flyers whose text IS the content
 * (speaker names, venues, schedules). A single object-cover crop serves
 * the first and mutilates the second — a 16:10 crop of a 0.7-ratio
 * poster discards more than half of it.
 *
 * So nothing is cropped. The image is letterboxed with object-contain
 * over a blurred, scaled copy of itself, which keeps every tile the
 * same size while leaving the artwork intact whatever its ratio.
 *
 * Requires a positioned, size-constrained parent (both layers are
 * `fill`).
 */
export default function EventArtwork({
  src,
  alt,
  sizes,
  className = '',
  priority,
}: Props) {
  return (
    <>
      <Image
        src={blurBackdropUrl(src)}
        alt=""
        aria-hidden
        fill
        sizes="64px"
        className="scale-125 object-cover blur-2xl"
      />
      {/* Knocks the backdrop back so it reads as a surface, not a
          second image competing with the artwork. */}
      <div className="absolute inset-0 bg-black/15" />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-contain ${className}`}
      />
    </>
  );
}
