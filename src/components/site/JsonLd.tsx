/**
 * Вставка JSON-LD в разметку страницы.
 *
 * Отдельный компонент нужен, чтобы не разбрасывать dangerouslySetInnerHTML
 * по страницам: сюда приходит уже сериализованная строка из lib/schema.ts.
 */
export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
