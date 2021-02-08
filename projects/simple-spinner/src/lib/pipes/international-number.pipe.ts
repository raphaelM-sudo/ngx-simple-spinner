import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language/language.service';

@Pipe({ name: 'iNumber' })
export class InternationalNumberPipe implements PipeTransform {

  private _offset: number;

  constructor(langService: LanguageService) {
    switch (langService.preferredLanguage) {
      // Arabic-Indic
      case 'ar': // Arabic
        this._offset = 1584;
        break;
      // Eastern Arabic-Indic
      case 'fa': // Persian
      case 'ur': // Urdu
        this._offset = 1728;
        break;
      // Ignore Hindi, Thai, ... numerals, since they are rarely used
    }
  }

  transform(number: string | number): string {
    const numStr = String(number);

    /*
    European             U+0030..U+0039   0123456789
    Arabic-Indic         U+0660..U+0669   ٠١٢٣٤٥٦٧٨٩
    Eastern Arabic-Indic U+06F0..U+06F9   äÒÚÛÙıˆ˜¯˘
    */
    if (this._offset === undefined) {
      return numStr;
    }

    let transformedNumStr = '';

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < numStr.length; i++) {
      const charCode = numStr.charCodeAt(i);

      if (charCode < 48 || charCode > 57) {
        transformedNumStr += numStr[i];
        continue;
      }

      transformedNumStr += String.fromCharCode(charCode + this._offset);
    }

    return transformedNumStr;
  }
}
