import next from 'eslint-config-next';

/** Плоская конфигурация ESLint для Next.js 16. */
export default [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
];
