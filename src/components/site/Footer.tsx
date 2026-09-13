import Image from 'next/image';
import Link from 'next/link';
import { Container } from '../layout/Container';
import { Icon } from '../ui/Icon';
import { siteName } from '@/content/site';
import type { NavItem, SiteContacts } from '@/content/types';
import s from './site.module.css';

type Props = {
  nav: readonly NavItem[];
  serviceNav: readonly NavItem[];
  contacts: SiteContacts;
  /** Реквизиты организации — переносятся дословно (ТЗ §2). */
  legalLines?: readonly string[];
};

/** Компактный структурный подвал: реквизиты, ссылки и контакты сохраняются. */
export function Footer({ nav, serviceNav, contacts, legalLines }: Props) {
  const year = new Date().getFullYear();
  const sections = nav.filter((i) => i.href !== null).slice(0, 8);

  return (
    <footer className={s.footer}>
      <Container>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <Link className={s.footerBrandRow} href="/">
              <Image src="/brand/logo-white.png" alt="" width={248} height={202} className={s.footerLogo} />
              <span className={s.brandName}>{siteName}</span>
            </Link>

            {contacts.addresses.map((a) => (
              <span key={a} className={s.footerLink} style={{ cursor: 'default' }}>
                <Icon name="pin" size={18} />
                {a}
              </span>
            ))}

            {contacts.phones.map((p) => (
              <a key={p.tel} className={s.footerLink} href={`tel:${p.tel}`}>
                <Icon name="phone" size={18} />
                {p.display}
              </a>
            ))}

            {contacts.emails.map((e) => (
              <a key={e} className={s.footerLink} href={`mailto:${e}`}>
                <Icon name="mail" size={18} />
                {e}
              </a>
            ))}

            {contacts.socials.length > 0 ? (
              <div className={s.socials}>
                {contacts.socials.map((soc) => (
                  <a
                    key={soc.href}
                    className={s.socialLink}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {soc.label}
                  </a>
                ))}
              </div>
            ) : null}

            {contacts.phones.length === 0 && contacts.addresses.length === 0 ? (
              <p className={s.pendingNote}>
                Контактные данные переносятся с действующего сайта на этапе инвентаризации и не
                заполняются вручную.
              </p>
            ) : null}
          </div>

          {sections.length > 0 ? (
            <div>
              <p className={s.footerColTitle}>Разделы</p>
              <ul className={s.footerList}>
                {sections.map((item) => (
                  <li key={item.label}>
                    <Link className={s.footerLink} href={item.href ?? '/'}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className={s.footerColTitle}>Информация</p>
            <ul className={s.footerList}>
              {serviceNav.map((item) =>
                item.href ? (
                  <li key={item.label}>
                    <Link className={s.footerLink} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={item.label}>
                    <span className={s.footerLink} style={{ opacity: 0.5 }}>
                      {item.label}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className={s.footerBottom}>
          <span>
            © {year} {siteName}
          </span>
          {legalLines?.map((line) => <span key={line}>{line}</span>)}
        </div>
      </Container>
    </footer>
  );
}
