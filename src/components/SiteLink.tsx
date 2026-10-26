import type { ComponentProps } from 'react';
import { navigationHref } from '@/lib/navigation';

// Ordinary document navigation; no router, prefetch, effects or URL rewriting after hydration.
export default function SiteLink({ href, ...props }: ComponentProps<'a'>) {
  return <a {...props} href={href === undefined ? undefined : navigationHref(href)} />;
}
