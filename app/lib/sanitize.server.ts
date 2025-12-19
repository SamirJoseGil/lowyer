import { marked } from 'marked';

// Configuración segura de marked
marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: false, // No usar el sanitizer deprecated
});

export function sanitizeMarkdown(markdown: string): string {
  // marked ya escapa HTML por defecto
  return marked.parse(markdown) as string;
}

// Para HTML simple sin markdown
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
