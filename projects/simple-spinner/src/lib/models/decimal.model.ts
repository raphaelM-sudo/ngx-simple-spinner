declare global {
  interface Number {
    toFixedNoRounding: (fractionDigits?: number) => number;
  }
}

Number.prototype.toFixedNoRounding = function(fractionDigits = 0): number {
  const valueStr = this.toString();
  const commaIndex = valueStr.indexOf('.');

  if (commaIndex !== -1) {
    return +valueStr.substr(0, commaIndex + fractionDigits + 1);
  }

  return this;
};

export enum Round {
  Up,
  Down
}

export class SimpleDecimal {

  private _value: number;
  private _maxDecimalPlacesFn: () => number;
  private _integerPart: number;
  private _dividend: number;
  private _divisor: number;

  get integerPart(): number {
    if (this._integerPart == null) {
      const valueStr = this.toString();
      const commaIndex = valueStr.indexOf('.');
      const integerPart = +valueStr.substr(0, commaIndex);

      if (commaIndex !== -1) {
        this._integerPart = integerPart;
      } else {
        this._integerPart = this.value;
      }
    }
    return this._integerPart;
  }

  get decimalPart(): number {
    const valueStr = this.toString();
    const commaIndex = valueStr.indexOf('.');

    if (commaIndex !== -1) {
      if (this.value >= 0) {
        return +('0.' + valueStr.substr(commaIndex + 1, this.maxDecimalPlaces));
      }
      return -('0.' + valueStr.substr(commaIndex + 1, this.maxDecimalPlaces));
    }

    return 0;
  }

  get dividend(): number {
    this.calculateFraction();
    return this._dividend;
  }

  get divisor(): number {
    this.calculateFraction();
    return this._divisor;
  }

  get decimalPlaces(): number {
    const valueStr = this.toString();
    const commaIndex = valueStr.indexOf('.');

    return commaIndex !== -1 ? valueStr.length - commaIndex : 0;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {

    this._value = null;

    if (value != null) {
      this._value = +Number(value).toFixedNoRounding(this.maxDecimalPlaces);
    }

    this._integerPart = null;
    this._dividend = null;
    this._divisor = null;
  }

  get maxDecimalPlaces(): number {
    return this._maxDecimalPlacesFn();
  }

  get hasPrettyFraction(): boolean {
    if (this.dividend && this.divisor) {
      return true;
    }
    return false;
  }

  get precedingStr(): string {
    const integerPart = this.integerPart;
    return '' + (integerPart !== 0 ? integerPart : (this.value < 0 ? '-' : ''));
  }

  get dividendStr(): string {
    return '' + this.dividend;
  }

  get divisorStr(): string {
    return '' + this.divisor;
  }

  private calculateFraction() {

    if (this.maxDecimalPlaces >= 2 && !(this._dividend && this._divisor) ) {

      const decimalPart = Math.abs(this.decimalPart);

      if (decimalPart) {

        switch (decimalPart) {
          case (1 / 4).toFixedNoRounding(this.maxDecimalPlaces):
          this._dividend = 1;
          this._divisor = 4;
          break;
          case (1 / 3).toFixedNoRounding(this.maxDecimalPlaces):
          this._dividend = 1;
          this._divisor = 3;
          break;
          case (1 / 2).toFixedNoRounding(this.maxDecimalPlaces):
          this._dividend = 1;
          this._divisor = 2;
          break;
          case (2 / 3).toFixedNoRounding(this.maxDecimalPlaces):
          case +(2 / 3).toFixed(this.maxDecimalPlaces):
          this._dividend = 2;
          this._divisor = 3;
          break;
          case (3 / 4).toFixedNoRounding(this.maxDecimalPlaces):
          this._dividend = 3;
          this._divisor = 4;
          break;
        }
      }
    }
  }

  toString(): string {
    if (this.value != null) {
      return String(this.value).replace(',', '.');
    } else {
      return '';
    }
  }

  add(i: number): SimpleDecimal {
    this.value += i;
    return this;
  }

  sub(i: number): SimpleDecimal {
    this.value -= i;
    return this;
  }

  toNearest(multiple: number, roundMode: Round = Round.Up): number {

    multiple = +multiple.toFixed(this.maxDecimalPlaces);

    if (multiple > 0 && this.value != null) {

      let quotient = +(this.decimalPart / multiple).toFixed(this.maxDecimalPlaces);

      switch (roundMode) {
        case Round.Down:
          quotient = Math.ceil(quotient) - 1;
          break;
        default:
          quotient = Math.floor(quotient) + 1;
          break;
      }

      return +(this.integerPart + (multiple * quotient)).toFixed(this.maxDecimalPlaces);
    }

    return this.value;
  }

  constructor(maxDecimalPlaces: (() => number) | number, value: number = null) {
    this._maxDecimalPlacesFn = maxDecimalPlaces instanceof Function ? maxDecimalPlaces : () => maxDecimalPlaces;
    this.value = value;
  }
}
