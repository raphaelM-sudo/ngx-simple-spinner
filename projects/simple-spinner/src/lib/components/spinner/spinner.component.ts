import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import {
    Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, ElementRef, Input,
    Optional, Self, ViewChild, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import {
    CanDisable, CanDisableCtor, CanUpdateErrorState, CanUpdateErrorStateCtor, ErrorStateMatcher,
    HasTabIndex, HasTabIndexCtor, mixinDisabled, mixinErrorState, mixinTabIndex
} from '@angular/material/core';

import { Round, SimpleDecimal } from '../../models/decimal.model';
import { Direction } from '../../models/direction.enum';
import { DeviceService } from '../../services/device/device.service';
import { LanguageService } from '../../services/language/language.service';
import { SpinnerKeyManager } from '../a11y/key-manager/spinner-key-manager';

let nextUniqueId = 0;

export const BUFFER_TIMEOUT = 250;
export const TIMEOUT = 50;

class SimpleSpinnerBase {
  constructor(public _elementRef: ElementRef,
              public _defaultErrorStateMatcher: ErrorStateMatcher,
              public _parentForm: NgForm,
              public _parentFormGroup: FormGroupDirective,
              public ngControl: NgControl) {}
}

const _SimpleSpinnerMixinBase:
    CanDisableCtor &
    HasTabIndexCtor &
    CanUpdateErrorStateCtor &
    typeof SimpleSpinnerBase = mixinTabIndex(mixinDisabled(mixinErrorState(SimpleSpinnerBase)));

@Component({
  selector: 'simple-spinner',
  exportAs: 'simpleSpinner',
  templateUrl: './spinner.component.html',
  inputs: ['disabled', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    class: 'simple-spinner',
    role: 'input',
    '[attr.aria-label]': 'ariaLabel',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[class.simple-disabled]': 'disabled',
    '[class.simple-required]': 'required',
    '(keydown)': '!disabled && keyManager.catchKey($event)'
  }
})
export class SpinnerComponent extends _SimpleSpinnerMixinBase
implements ControlValueAccessor, DoCheck, CanDisable, HasTabIndex, CanUpdateErrorState {

  @Input('aria-label') private _ariaLabel?: string;
  @Input() placeholder?: string;
  @Input() dir?: 'ltr' | 'rtl' | 'auto';
  @Input() errorStateMatcher: ErrorStateMatcher;

  @Input()
  get id(): string { return this._id; }
  set id(id: string) {
    this._id = id || this.uid;
  }

  @Input()
  get value(): number { return this.decimal.value; }
  set value(value: number) {
    this.decimal.value = value;
    // Return the decimal value instead of value, to propagate the rounded value
    this.propagateChange(this.decimal.value);
  }

  @Input()
  get min(): number { return this._min; }
  set min(min: number) {
    if (min != null) {
      min = parseFloat(min as unknown as string);

      if (!isNaN(min)) {
        this._min = Math.min(Math.max(min, Number.MIN_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
      }
    }
  }

  @Input()
  get max(): number { return this._max; }
  set max(max: number) {
    if (max != null) {
      max = parseFloat(max as unknown as string);

      if (!isNaN(max)) {
        this._max = Math.min(Math.max(max, Number.MIN_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
      }
    }
  }

  @Input()
  get hoverBorder(): boolean { return this._hoverBorder; }
  set hoverBorder(hoverBorder: boolean) {
    this._hoverBorder = coerceBooleanProperty(hoverBorder);
  }

  @Input()
  get hoverNav(): boolean { return this._hoverNav; }
  set hoverNav(hoverNav: boolean) {
    this._hoverNav = coerceBooleanProperty(hoverNav);
  }

  @Input()
  get fractions(): boolean { return this._fractions; }
  set fractions(fractions: boolean) {
    this._fractions = coerceBooleanProperty(fractions);
  }

  @Input()
  get i18nNumbers(): boolean { return this._i18nNumbers; }
  set i18nNumbers(i18nNumbers: boolean) {
    this._i18nNumbers = coerceBooleanProperty(i18nNumbers);
  }

  @Input()
  get bigStep(): number { return this._bigStep ; }
  set bigStep(bigStep: number) {
    bigStep = coerceNumberProperty(bigStep);
    this._bigStep = Math.min(Math.max(bigStep, Number.MIN_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  }

  @Input()
  get smallStep(): number { return this._smallStep ; }
  set smallStep(smallStep: number) {
    smallStep = coerceNumberProperty(smallStep);
    this._smallStep = Math.min(Math.max(smallStep, Number.MIN_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
  }

  @Input()
  get maxDecimalPlaces(): number { return this._maxDecimalPlaces ; }
  set maxDecimalPlaces(maxDecimalPlaces: number) {
    this._maxDecimalPlaces  = coerceNumberProperty(maxDecimalPlaces);
  }

  @Input()
  get required(): boolean { return this._required; }
  set required(required: boolean) {
    this._required = coerceBooleanProperty(required);
  }

  get direction(): Direction {
    switch (this.dir) {
      case 'ltr':
        return Direction.LeftToRight;
      case 'rtl':
        return Direction.RightToLeft;
      case 'auto':
        return this.langService.isRTLpreferred() ? Direction.RightToLeft : Direction.LeftToRight;
      default:
        return Direction.Default;
    }
  }

  get showBorder() {
    // Always show the border if disabled or focused
    return this.disabled || this.focus || this.errorState || !this.hoverBorder || this.hoverBorder && this.hover;
  }

  get showNav() {
    // Always show the navigation if disabled or focused
    // Never show on mobile
    return !this.device.mobileOrTablet && (this.disabled || this.focus || !this.hoverNav || this.hoverNav && this.hover);
  }

  get showFractionOverlay() {
    return this.decimal.hasPrettyFraction && this.fractions && (this.disabled || !this.hover && !this.focus);
  }

  get showPlaceholder() {
    return this.decimal.value == null && this.placeholder != null && !this.focus;
  }

  get ariaLabel(): string | null {
    return this._ariaLabel || this.placeholder;
  }

  @ViewChild('numberInput', { static: true }) numberInput: ElementRef;

  decimal: SimpleDecimal;
  keyManager: SpinnerKeyManager;

  hover = false;
  focus = false;
  intervalHandler = null;
  // Regex allows all numerals (0-9, Arabic, Hindi, Thai, ...) and commas
  // tslint:disable-next-line: max-line-length
  filterKeyRegex = /^[0-9\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u09E6-\u09EF\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u1040-\u1049\u17E0-\u17E9\u0E50-\u0E59\u0ED0-\u0ED9\u1810-\u1819\u0F20-\u0F29.,\-]+$/;

  private _id: string;
  private _min = Number.MIN_SAFE_INTEGER;
  private _max = Number.MAX_SAFE_INTEGER;
  private _hoverBorder = false;
  private _hoverNav = true;
  private _fractions = false;
  private _i18nNumbers = true;
  private _bigStep = 1;
  private _smallStep = 1;
  private _maxDecimalPlaces = 0;
  private _required = false;

  private uid = `simple-spinner-${++nextUniqueId}`;

  // Enum for usage in template
  Direction = Direction;

  propagateChange = (_: any) => {};
  propagateTouched = () => {};

  checkValue() {
    // This has to be done over the ElementRef because Angular won't emit a change if the value stays the same
    // Also the value should only be submitted after blur
    const value = parseFloat(this.numberInput.nativeElement.value);
    this.value = isNaN(value) ? null : Math.min(Math.max(value, this.min), this.max);
    this.numberInput.nativeElement.value = this.value;
  }

  filterKey(event: KeyboardEvent) {
    if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.code !== '' && // On Chrome for Android the code is empty
        event.key !== event.code &&
        !event.key.match(this.filterKeyRegex)
      ) {

      event.preventDefault();
    }
  }

  increment() {

    // Special logic for increment only, in case the value is null / undefined
    // It does not get more readable :(
    if (this.decimal.value == null) {
      if (this.min === Number.MIN_SAFE_INTEGER) {
        this.decimal.value = Math.min(this.max, this.bigStep);
      } else if (this.max === Number.MAX_SAFE_INTEGER) {
        this.decimal.value = Math.max(this.min, this.bigStep);
      } else {
        this.decimal.value = Math.min(this.max, this.bigStep);
      }

      this.propagateChange(this.decimal.value);
      this.cdRef.markForCheck();

      return;
    }

    // This might happen if the user sets the value lower than the min (same behaviour in Chrome)
    if (this.decimal.value < this.min) {
      this.decimal.value = this.min;

      this.propagateChange(this.decimal.value);
      this.cdRef.markForCheck();

      return;
    }

    if (this.decimal.value < this.max) {
      // If an integer and less or equal to max - 1
      if (this.decimal.decimalPlaces === 0 && this.decimal.value <= (this.max - this.bigStep)) {

        this.decimal.value += this.bigStep; // add

      } else { // Float value or greater than max - 1

        // Next closest value plus step: 0.6 -> 0.75 -> 1 ...
        const stepValue = this.decimal.toNearest(this.smallStep, Round.Up);

        // If less or equal to max then set the value to the new stepValue
        if (stepValue <= this.max) {
          this.decimal.value = stepValue;
        } else {
          this.decimal.value = this.max;
        }
      }

      this.propagateChange(this.decimal.value);
      this.cdRef.markForCheck();
    } else {
      // Select value if max was reached
      this.numberInput.nativeElement.select();
    }
  }

  decrement() {

    // Special logic for decrement only, in case the value is null / undefined
    // It does not get more readable :(
    if (this.decimal.value == null) {
      if (this.max === Number.MAX_SAFE_INTEGER) {
        this.decimal.value = Math.max(this.min, -this.bigStep);
      } else if (this.min === Number.MIN_SAFE_INTEGER) {
        this.decimal.value = Math.min(this.max, -this.bigStep);
      } else {
        this.decimal.value = Math.max(this.min, -this.bigStep);
      }

      this.propagateChange(this.decimal.value);
      this.cdRef.markForCheck();

      return;
    }

    // This might happen if the user sets the value higher than the max (same behaviour in Chrome)
    if (this.decimal.value > this.max) {
      this.decimal.value = this.max;

      this.propagateChange(this.decimal.value);
      this.cdRef.markForCheck();

      return;
    }

    if (this.decimal.value > this.min) {
      // If an integer and greater or equal than min + 1
      if (this.decimal.decimalPlaces === 0 && this.decimal.value >= (this.min + this.bigStep)) {

        this.decimal.value -= this.bigStep; // subtract

      } else { // Float value or smaller than min + 1

        // Next closest value minus step: 0.6 -> 0.5 -> 0.25 ...
        const stepValue = this.decimal.toNearest(this.smallStep, Round.Down);

        // If greater or equal to min then set the value to the new stepValue
        if (stepValue >= this.min) {
          this.decimal.value = stepValue;
        } else {
          this.decimal.value = this.min;
        }
      }

      this.propagateChange(this.decimal.value);
      this.cdRef.markForCheck();
    } else {
      // Select value if min was reached
      this.numberInput.nativeElement.select();
    }
  }

  add(once?: boolean) {
    if (once) {
      this.increment();
    } else {
      this.startCount(() => this.increment());
    }
  }

  subtract(once?: boolean) {
    if (once) {
      this.decrement();
    } else {
      this.startCount(() => this.decrement());
    }
  }

  startCount(callback: () => void) {
    callback();
    this.intervalHandler = setTimeout(() => {
      this.intervalHandler = setInterval(() => {
        callback();
      }, TIMEOUT);
    }, BUFFER_TIMEOUT);
  }

  stopCount() {
    if (this.intervalHandler) {
      clearInterval(this.intervalHandler);
      this.intervalHandler = null;
    }
  }

  mouseenter() {
    this.hover = true;
  }

  mouseleave() {
    this.hover = false;
  }

  focusInput() {
    this.focus = true;
  }

  changeInput() {
    this.propagateTouched();
  }

  blurInput() {
    this.checkValue();
    this.focus = false;
  }

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: () => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private langService: LanguageService,
    public device: DeviceService,
    elementRef: ElementRef,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Self() @Optional() public ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string) {

    super(elementRef, _defaultErrorStateMatcher, _parentForm,
      _parentFormGroup, ngControl);

    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      // It has to be done this way also, to be able to access the errorState.
      this.ngControl.valueAccessor = this;
    }

    this.decimal = new SimpleDecimal(() => this.maxDecimalPlaces);
    this.keyManager = new SpinnerKeyManager(this);

    this.tabIndex = parseInt(tabIndex, 10) || 0;

    // Force setter to be called in case id was not specified.
    this.id = this.id;
  }
}
