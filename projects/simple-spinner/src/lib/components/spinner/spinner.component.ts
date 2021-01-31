import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
import { DeviceService } from '../../services/device/device.service';
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
    '(keydown)': 'keyManager.catchKey($event)'
  }
})
export class SpinnerComponent extends _SimpleSpinnerMixinBase
implements ControlValueAccessor, DoCheck, CanDisable, HasTabIndex, CanUpdateErrorState {

  @Input('aria-label') private _ariaLabel?: string;
  @Input() placeholder?: string;
  @Input() hoverBorder = false;
  @Input() animate = true;
  @Input() dir?: 'ltr' | 'rtl' | 'auto';
  @Input() bigStep = 1;
  @Input() smallStep = 0.25;
  @Input() maxDecimalPlaces = 2;
  @Input() errorStateMatcher: ErrorStateMatcher;

  @Input()
  get id(): string { return this._id; }
  set id(id: string) {
    this._id = id || this.uid;
  }

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }

  @Input()
  get min(): number { return this._min; }
  set min(min: number) {
    if (min != null) {
      min = parseFloat(min as unknown as string);

      if (!isNaN(min)) {
        this._min = min;
      }
    }
  }

  @Input()
  get max(): number { return this._max; }
  set max(max: number) {
    if (max != null) {
      max = parseFloat(max as unknown as string);

      if (!isNaN(max)) {
        this._max = max;
      }
    }
  }

  @Input()
  get value(): number { return this.decimal.value; }
  set value(value: number) {
    this.decimal.value = value;
    this.propagateChange(value);
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
  filterKeyRegex = /^[0-9.,\-]+$/;
  filterPasteRegex = /^\-?([1-9]+\d*|\d+[.,]\d+|0)$/;

  private _id: string;
  private _required = false;
  private _min = Number.MIN_SAFE_INTEGER;
  private _max = Number.MAX_SAFE_INTEGER;

  private uid = `simple-spinner-${++nextUniqueId}`;

  propagateChange = (_: any) => {};
  propagateTouched = () => {};

  checkValue() {
    // This has to be done over the ElementRef because Angular won't emit a change if the value stays the same
    const value = parseFloat(this.numberInput.nativeElement.value);
    this.value = isNaN(value) ? null : Math.min(Math.max(value, this.min), this.max);
    this.numberInput.nativeElement.value = this.value;
    this.propagateTouched();
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

  filterPaste(event: ClipboardEvent) {
    if (!event.clipboardData.getData('text').match(this.filterPasteRegex)) {
      event.preventDefault();
    }
  }

  increment() {

    // Special logic for increment only, in case the value is null / undefined
    if (this.decimal.value == null) {
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
    if (this.decimal.value == null) {
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

  add(event: Event, once?: boolean) {
    event.preventDefault();

    if (once) {
      this.increment();
    } else {
      this.startCount(() => this.increment());
    }
  }

  subtract(event: Event, once?: boolean) {
    event.preventDefault();

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

  blurInput() {
    this.focus = false;
  }

  showFractionOverlay() {
    return this.decimal.hasPrettyFraction && !this.hover && !this.focus;
  }

  writeValue(value: number): void {
    if (value != null) {
      this.value = value;
    }
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

    this.decimal = new SimpleDecimal(this.maxDecimalPlaces);
    this.keyManager = new SpinnerKeyManager(this);

    this.tabIndex = parseInt(tabIndex, 10) || 0;

    // Force setter to be called in case id was not specified.
    this.id = this.id;
  }
}
