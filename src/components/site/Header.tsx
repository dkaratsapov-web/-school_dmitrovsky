'use client';

import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Button, ButtonLink } from '../ui/Button';
import { Container } from '../layout/Container';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { DesktopNav } from './DesktopNav';
import type { NavItem, SiteContacts } from '@/content/types';
import s from './site.module.css';

type Props = {
  nav: readonly NavItem[];
  contacts: SiteContacts;
  /** Главное действие. Текст и адрес переносятся с текущего сайта, не сочиняются. */
  cta?: { label: string; href: string };
  /** Ссылка на версию для слабовидящих — сохраняется, если она есть сейчас. */
  accessibilityHref?: string;
};

export function Header({ nav, contacts, cta, accessibilityHref }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const hasUtility =
    contacts.phones.length > 0 || contacts.socials.length > 0 || accessibilityHref !== undefined;

  return (
    <header className={s.header}>
      {hasUtility ? (
        <div className={s.utility}>
          <Container>
            <div className={s.utilityInner}>
              <div className={s.utilityGroup}>
                {contacts.phones.map((p) => (
                  <a key={p.tel} className={s.utilityLink} href={`tel:${p.tel}`}>
                    <Icon name="phone" size={16} />
                    {p.display}
                    {p.label ? <span className="visually-hidden"> — {p.label}</span> : null}
                  </a>
                ))}
              </div>
              <div className={s.utilityGroup}>
                {contacts.socials.map((soc) => (
                  <a
                    key={soc.href}
                    className={s.utilityLink}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {soc.label}
                  </a>
                ))}
                {accessibilityHref ? (
                  <a className={s.utilityLink} href={accessibilityHref}>
                    <Icon name="eye" size={16} />
                    Версия для слабовидящих
                  </a>
                ) : null}
              </div>
            </div>
          </Container>
        </div>
      ) : null}

      <Container>
        <div className={s.bar}>
          <Logo />

          <DesktopNav items={nav} />

          <div className={s.headerActions}>
            {cta ? (
              <ButtonLink className={s.headerCta} href={cta.href} variant="primary">
                {cta.label}
              </ButtonLink>
            ) : null}
            <Button
              className={s.burger}
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
            >
              <Icon name="menu" size={24} />
            </Button>
          </div>
        </div>
      </Container>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={nav}
        contacts={contacts}
        cta={cta}
      />
    </header>
  );
}
