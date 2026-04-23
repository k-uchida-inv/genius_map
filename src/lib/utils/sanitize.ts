import DOMPurify from 'isomorphic-dompurify';

/**
 * Convert simple markdown to HTML and sanitize against XSS.
 * Only allows safe tags: headings, lists, bold, paragraphs.
 */
export function renderMarkdownSafe(md: string): string {
  const html = md
    .replace(/^### (.+)$/gm, '<h3 style="color: var(--color-text-primary)" class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color: var(--color-text-primary)" class="text-base font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^[-*] (.+)$/gm, '<li style="color: var(--color-text-secondary)" class="text-sm ml-4 mb-1.5 list-disc leading-relaxed">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\>)\n(?!\<)/g, '<br/>');

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h2', 'h3', 'li', 'strong', 'p', 'br', 'ul', 'ol'],
    ALLOWED_ATTR: ['class', 'style'],
  });
}
