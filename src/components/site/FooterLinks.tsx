'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CallbackModal } from '../forms/CallbackModal';
import { InfoBody } from '../ui/InfoBody';
import { landingFooterNav, legalInfo } from '@/content/landing';
import type { LandingInfo } from '@/content/landing';
import { legalNav } from '@/content/navigation';
import s from './site.module.css';

/**
 * Ссылки подвала на время сборки лендинга.
 *
 * Состав пунктов сохранён (ТЗ §8): те, у которых на главной есть свой блок,
 * прокручивают к нему, остальные открывают окно с краткой справкой. Правовые
 * документы ещё не переданы, поэтому вместо перехода на несуществующий адрес
 * показывается окно с пояснением. Внешняя ссылка на официальный сайт школы
 * остаётся ссылкой.
 */
export function FooterLinks() {
  const [info, setInfo] = useState<LandingInfo | null>(null);
  const external = legalNav.filter((i) => i.external === true);
  const documents = legalNav.filter((i) => i.external !== true);

  return (
    <>
      <div>
        <p className={s.footerColTitle}>Разделы</p>
        <ul className={[s.footerList, s.footerListSplit].join(' ')}>
          {landingFooterNav.map((item) => (
            <li key={item.label}>
              {item.anchor ? (
                <Link className={s.footerLink} href={item.anchor}>
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={s.footerLink}
                  onClick={() => item.info && setInfo(item.info)}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className={s.footerColTitle}>Информация</p>
        <ul className={s.footerList}>
          {documents.map((item) => (
            <li key={item.label}>
              <button type="button" className={s.footerLink} onClick={() => setInfo(legalInfo)}>
                {item.label}
              </button>
            </li>
          ))}

          {external.map((item) => (
            <li key={item.label}>
              <a
                className={s.footerLink}
                href={item.href ?? '/'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <CallbackModal
        open={info !== null}
        onClose={() => setInfo(null)}
        title={info?.title ?? ''}
        text={info?.lead ?? ''}
        size="md"
      >
        <InfoBody
          {...(info?.text ? { text: info.text } : {})}
          {...(info?.points ? { points: info.points } : {})}
          {...(info?.facts ? { facts: info.facts } : {})}
        />
      </CallbackModal>
    </>
  );
}
