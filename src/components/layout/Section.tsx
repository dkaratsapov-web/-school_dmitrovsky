import type { ElementType, ReactNode } from 'react';
import { Container } from './Container';
import s from './layout.module.css';

export type SectionTone = 'default' | 'surface' | 'muted' | 'warm' | 'dark';

const toneClass: Record<SectionTone, string> = {
  default: '',
  surface: s.toneSurface ?? '',
  muted: s.toneMuted ?? '',
  warm: s.toneWarm ?? '',
  dark: s.toneDark ?? '',
};

type Props = {
  children: ReactNode;
  tone?: SectionTone;
  tight?: boolean;
  narrow?: boolean;
  id?: string;
  as?: ElementType;
  className?: string;
};

export function Section({
  children,
  tone = 'default',
  tight = false,
  narrow = false,
  id,
  as: Tag = 'section',
  className,
}: Props) {
  return (
    <Tag
      id={id}
      className={[s.section, tight ? s.sectionTight : '', toneClass[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      <Container narrow={narrow}>{children}</Container>
    </Tag>
  );
}

type HeadProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  headingLevel?: 2 | 3;
};

export function SectionHead({ eyebrow, title, lead, action, headingLevel = 2 }: HeadProps) {
  const Heading: ElementType = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className={s.sectionHead}>
      <div className={s.sectionHeadText}>
        {eyebrow ? <span className={s.eyebrow}>{eyebrow}</span> : null}
        <Heading>{title}</Heading>
        {lead ? <p className={s.sectionLead}>{lead}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
