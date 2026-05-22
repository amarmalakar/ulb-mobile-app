import type { TranslationSchema } from './en';

type Join<K extends string, P extends string> = `${K}.${P}`;

type NestedKeyOf<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? Prefix extends ''
      ? K
      : Join<Prefix, K>
    : T[K] extends Record<string, unknown>
      ? NestedKeyOf<T[K], Prefix extends '' ? K : Join<Prefix, K>>
      : never;
}[keyof T & string];

/** Dot-notation keys accepted by `t()`. */
export type TranslationKey = NestedKeyOf<TranslationSchema>;
