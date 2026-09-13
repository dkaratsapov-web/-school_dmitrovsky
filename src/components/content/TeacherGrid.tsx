import Image from 'next/image';
import { asset } from '@/lib/asset';
import type { Teacher } from '@/content/compositions';
import s from './compositions.module.css';

/**
 * Сетка педагогов.
 *
 * На действующем сайте карточка педагога — фотография во всю ширину полосы,
 * под ней должность, ФИО и подпись, а достижения спрятаны в отдельный
 * раскрывающийся блок в конце страницы. Здесь всё это собрано в одну
 * карточку: портрет в постоянной пропорции, ФИО, должность и достижения.
 * Формулировки перенесены дословно (ТЗ §7).
 */
export function TeacherGrid({ items }: { items: readonly Teacher[] }) {
  if (items.length === 0) return null;

  return (
    <ul className={s.people}>
      {items.map((t) => (
        <li key={t.name} className={s.person}>
          <article className={s.personCard}>
            <div className={s.personMedia}>
              {t.photo ? (
                <Image
                  src={asset(t.photo.src)}
                  alt={t.photo.alt}
                  width={t.photo.width}
                  height={t.photo.height}
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                />
              ) : (
                <span className={s.personNoPhoto} aria-hidden="true">
                  {initials(t.name)}
                </span>
              )}
            </div>

            <div className={s.personBody}>
              <h3 className={s.personName}>{t.name}</h3>
              {t.role ? <p className={s.personRole}>{t.role}</p> : null}
              {t.notes.map((n) => (
                <p key={n} className={s.personNote}>
                  {n}
                </p>
              ))}
              {t.achievements.length > 0 ? (
                <div className={s.personAchievements}>
                  <h4 className={s.personAchTitle}>Достижения</h4>
                  <ul className={s.personAchList}>
                    {t.achievements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

/** Инициалы вместо портрета, если фотографии педагога нет в выгрузке. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('');
}
