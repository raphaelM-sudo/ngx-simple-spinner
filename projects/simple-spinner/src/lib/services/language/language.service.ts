import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  // Caching
  private _language: string;
  private _isRTLpreferred: boolean;

  get preferredLanguage(): string {

      if (this._language !== undefined) {
        return this._language;
      }

      const nav = window.navigator;
      const browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'];

      // support for HTML 5.1 "navigator.languages"
      if (nav.languages instanceof Array) {
        for (const language of nav.languages) {
          if (language && language.length) {
            return this._language = String(language).substring(0, 2).toLowerCase();
          }
        }
      }

      // support for other well known properties in browsers
      for (const prop of browserLanguagePropertyKeys) {
        const language = nav[prop];
        if (language && language.length) {
          return this._language = String(language).substring(0, 2).toLowerCase();
        }
      }

      return this._language = null;
  }

  isRTLpreferred(): boolean {

    if (this._isRTLpreferred !== undefined) {
      return this._isRTLpreferred;
    }

    switch (this.preferredLanguage) {
      case 'ar':
      case 'dv':
      case 'fa':
      case 'ha':
      case 'he':
      case 'ks':
      case 'ku':
      case 'ms':
      case 'ps':
      case 'sd':
      case 'tg':
      case 'ug':
      case 'ur':
      case 'uz':
      case 'yi':
        return this._isRTLpreferred = true;
      default:
        return this._isRTLpreferred = false;
    }
  }
}
