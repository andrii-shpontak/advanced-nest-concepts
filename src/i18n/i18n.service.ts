import { Inject, Injectable, Scope } from '@nestjs/common';
import type * as Schema from '../assets/locales/en.json';
import * as en from '../assets/locales/en.json';
import * as uk from '../assets/locales/uk.json';
import { REQUEST } from '@nestjs/core';
import format from 'string-format';

type PathToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[]> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? `${F}.${Join<Extract<R, string[]>>}`
        : never
      : string;

@Injectable({ scope: Scope.REQUEST, durable: true })
export class I18nService {
  constructor(
    @Inject(REQUEST) private readonly payload: { localeCode: string },
  ) {}

  public static readonly defaultLanguage = 'en';
  public static readonly supportedLanguages = ['en', 'uk'];
  private readonly locales: Record<string, typeof Schema> = {
    en,
    uk,
  };

  translate(
    key: Join<PathToStringProps<typeof Schema>>,
    ...args: Array<string | Record<string, unknown>>
  ): string {
    const locale =
      this.locales[this.payload.localeCode ?? I18nService.defaultLanguage];

    // To support dot notation: "ERRORS.USER_NOT_FOUND"
    const text: string = key.split('.').reduce((o, i) => o[i], locale);
    return format(text, ...args);
  }
}
