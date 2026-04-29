export function stripHtmlStrict(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}
