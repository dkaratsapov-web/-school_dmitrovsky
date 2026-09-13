import { Icon } from '../ui/Icon';
import type { DocumentRef } from '@/content/types';
import s from './media.module.css';

/** Список документов. Ссылки и названия переносятся без изменений (ТЗ §7). */
export function DocumentList({ items }: { items: readonly DocumentRef[] }) {
  if (items.length === 0) return null;
  return (
    <ul className={s.docs}>
      {items.map((doc) => (
        <li key={doc.href}>
          <a className={s.doc} href={doc.href} target="_blank" rel="noopener noreferrer">
            <Icon name="document" size={24} className={s.docIcon} />
            <span className={s.docBody}>
              <span className={s.docTitle}>{doc.title}</span>
              {doc.fileType || doc.fileSize ? (
                <span className={s.docMeta}>
                  {[doc.fileType, doc.fileSize].filter(Boolean).join(' · ')}
                </span>
              ) : null}
            </span>
            <Icon name="download" size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
