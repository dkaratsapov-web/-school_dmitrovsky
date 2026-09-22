import data from './data/reviews.json';

/**
 * Отзывы о школе.
 *
 * Видеоотзывы лежат на Rutube: в data/reviews.json хранится только
 * идентификатор ролика, подпись и, если школа передала, свой кадр.
 * Список правится через админку (/admin).
 *
 * Проигрыватель Rutube подключается только когда человек нажал на
 * карточку: восемь встроенных плееров на странице тянули бы её вниз
 * ещё до того, как их кто-то посмотрел.
 *
 * Письменные отзывы не переносятся вручную: они живут на Яндекс Картах
 * и показываются официальным виджетом. Так они остаются настоящими
 * и обновляются сами, а школа не отвечает за пересказ чужих слов.
 * Нужен только идентификатор организации из адреса её карточки
 * на Яндекс Картах.
 */
export type VideoReview = {
  /** Идентификатор ролика на Rutube: хвост адреса /video/<id>/. */
  rutube: string;
  /** Кто говорит — имя или подпись, если школа её передала. */
  name?: string;
  /** Кем приходится школе: мама ученика 5 класса, выпускник 2024 года. */
  role?: string;
  /** Свой кадр для карточки. Без него на карточке знак школы. */
  poster?: { src: string; width: number; height: number; alt: string };
};

/** Страница ролика на Rutube: открывается по ссылке под окном. */
export function rutubeLink(id: string): string {
  return `https://rutube.ru/video/${id}/`;
}

/** Встраиваемый проигрыватель Rutube. */
export function rutubeEmbed(id: string): string {
  return `https://rutube.ru/play/embed/${id}/`;
}

export const reviewsLead: string = data.lead;

/** Идентификатор организации на Яндекс Картах. Пусто — виджет не выводится. */
export const yandexOrgId: string = data.yandexOrgId;

/** Ссылка на карточку организации: открывается из блока. */
export const yandexLink: string = data.yandexLink;

export const videoReviews: readonly VideoReview[] = data.videos as unknown as readonly VideoReview[];
