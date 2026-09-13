/** Формат даты для вывода. Само значение даты не изменяется (ТЗ §7). */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Сортировка по дате, от новых к старым. Порядок новостей сохраняется по датам. */
export function byDateDesc<T extends { date: string }>(items: readonly T[]): readonly T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
