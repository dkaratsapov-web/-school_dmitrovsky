import { Icon } from '../ui/Icon';
import { contacts } from '@/content/site';
import s from './call-button.module.css';

/**
 * Кнопка звонка, которая стоит на экране постоянно.
 *
 * На телефоне в шапке остаются только знак школы и кнопка меню: номер
 * оттуда убран, чтобы ряд не был тесным. Звонок — главное действие
 * школьного сайта, поэтому он не прячется в меню, а висит у края экрана
 * и доступен с любого места страницы.
 *
 * На широком экране кнопки нет: там номер стоит в шапке целиком.
 * Когда внизу показано уведомление о куках, кнопка поднимается над ним.
 */
export function CallButton() {
  const phone = contacts.phones[0];
  if (!phone) return null;

  return (
    <a className={s.call} href={`tel:${phone.tel}`} aria-label={`Позвонить ${phone.display}`}>
      <span className={s.ring} aria-hidden="true" />
      <Icon name="phone" size={22} />
    </a>
  );
}
