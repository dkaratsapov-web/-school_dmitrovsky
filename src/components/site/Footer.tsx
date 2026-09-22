import Image from 'next/image';
import Link from 'next/link';
import logoWhite from '@/assets/brand/logo-white.png';
import { Container } from '../layout/Container';
import { FooterLinks } from './FooterLinks';
import { Icon } from '../ui/Icon';
import { BrandIcon } from '../ui/BrandIcon';
import type { BrandName } from '../ui/BrandIcon';
import { siteName } from '@/content/site';
import type { SiteContacts } from '@/content/types';
import s from './site.module.css';

type Props = {
  contacts: SiteContacts;
  /** Реквизиты организации — переносятся дословно (ТЗ §2). */
  legalLines?: readonly string[];
};

const BRANDS: readonly BrandName[] = ['Telegram', 'ВКонтакте', 'MAX', 'Rutube'];

function brandOf(network: string): BrandName | null {
  return BRANDS.find((b) => b === network) ?? null;
}

/** Компактный структурный подвал: реквизиты, ссылки и контакты сохраняются. */
export function Footer({ contacts, legalLines }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer} id="contacts">
      <Container>
        <div className={s.footerTop}>
          <div className={s.footerBrand}>
            <Link className={s.footerBrandRow} href="/">
              <Image src={logoWhite} alt="" className={s.footerLogo} />
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
                {contacts.socials.map((soc) => {
                  const brand = brandOf(soc.network);
                  return (
                    <a
                      key={soc.href}
                      className={s.socialLink}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={soc.label}
                      title={soc.label}
                    >
                      {brand ? <BrandIcon name={brand} size={20} /> : soc.label}
                    </a>
                  );
                })}
              </div>
            ) : null}

            {contacts.phones.length === 0 && contacts.addresses.length === 0 ? (
              <p className={s.pendingNote}>
                Контактные данные переносятся с действующего сайта на этапе инвентаризации и не
                заполняются вручную.
              </p>
            ) : null}
          </div>

          <FooterLinks />
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
