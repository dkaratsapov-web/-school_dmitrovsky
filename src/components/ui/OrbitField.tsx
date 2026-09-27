/**
 * Узор для тёмных полос сайта.
 *
 * По краям, где остаётся пустая заливка, идёт редкая сетка точек, а в неё
 * вписаны знаки школы — атом с орбитами. Орбиты медленно поворачиваются,
 * каждая со своей скоростью и в свою сторону, поэтому пустое место живёт,
 * но ничего не отвлекает: контраст у узора ниже текста в десять раз.
 *
 * Слой декоративный: не читается с экрана, не ловит курсор и не лезет
 * в поток. При выключенной анимации поворот останавливается.
 */
import s from './orbit-field.module.css';

function Atom({ className }: { className?: string }) {
  return (
    <svg className={[s.atom, className].filter(Boolean).join(' ')} viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10.2" ry="4.4" transform="rotate(-28 12 12)" />
      <ellipse cx="12" cy="12" rx="10.2" ry="4.4" transform="rotate(28 12 12)" />
      <circle className={s.core} cx="12" cy="12" r="2.2" />
    </svg>
  );
}

/**
 * @param quiet только сетка точек, без знаков: для полос, где содержимое
 *   занимает всю ширину и знаку негде встать, не попав под текст
 */
export function OrbitField({ quiet = false }: { quiet?: boolean } = {}) {
  return (
    <span className={s.field} aria-hidden="true">
      {quiet ? null : (
        <>
          <Atom className={s.one} />
          <Atom className={s.two} />
          <Atom className={s.three} />
        </>
      )}
    </span>
  );
}
