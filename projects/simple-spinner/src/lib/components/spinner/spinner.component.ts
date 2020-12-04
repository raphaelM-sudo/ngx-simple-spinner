import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnInit,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import {
    ControlValueAccessor, FormGroupDirective, NG_VALUE_ACCESSOR, NgControl, NgForm
} from '@angular/forms';
import {
    CanDisable, CanDisableCtor, CanUpdateErrorState, CanUpdateErrorStateCtor, ErrorStateMatcher,
    HasTabIndex, HasTabIndexCtor, mixinDisabled, mixinErrorState, mixinTabIndex
} from '@angular/material/core';

import { Round, SimpleDecimal } from '../../models/decimal.model';
import { SpinnerKeyManager } from '../a11y/key-manager/spinner-key-manager';

export const BUFFER_TIMEOUT = 250;
export const TIMEOUT = 50;

@Component({
  selector: 'simple-spinner',
  exportAs: 'simpleSpinner',
  templateUrl: './spinner.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SpinnerComponent),
      multi: true
    }
  ],
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    class: 'simple-spinner',
    '(keydown)': 'keyManager.catchKey($event)'
  }
})
export class SpinnerComponent implements OnInit, ControlValueAccessor {

  @Input('aria-label') private _ariaLabel?: string;
  @Input() placeholder?: string;
  @Input() hoverBorder = false;
  @Input() animate = true;
  @Input() dir?: 'ltr' | 'rtl' | 'auto';
  @Input() bigStep = 1;
  @Input() smallStep = 0.25;
  @Input() maxDecimalPlaces = 3;
  @Input() errorStateMatcher: ErrorStateMatcher;

  @Input()
  get min(): number {
    return this._min;
  }

  set min(min: number) {
    if (min != null) {
      this._min = Number(min);
    }
  }

  @Input()
  get max(): number {
    return this._max;
  }

  set max(max: number) {
    if (max != null) {
      this._max = Number(max);
    }
  }

  @Input()
  get value(): number {
    return this.decimal.value;
  }

  set value(value: number) {
    this.decimal.value = value;
  }

  @ViewChild('numberInput', { static: true }) numberInput: ElementRef;

  decimal: SimpleDecimal;
  keyManager: SpinnerKeyManager;

  hover = false;
  focus = false;
  intervalHandler = null;
  filterKeyRegex = /^[0-9.,\-]+$/;
  filterPasteRegex = /^\-?([1-9]+\d*|\d+[.,]\d+)$/;

  private _min = Number.MIN_SAFE_INTEGER;
  private _max = Number.MAX_SAFE_INTEGER;

  propagateChange = (_: any) => {};
  propagateTouched = () => {};

  checkValue() {
    // This has to be done over the ElementRef because Angular won't emit a change if the value stays the same
    this.decimal.value = Math.min(Math.max(this.decimal.value, this.min), this.max);
    this.numberInput.nativeElement.value = this.decimal.value;
  }

  filterKey(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key !== event.code && !event.key.match(this.filterKeyRegex)) {
      event.preventDefault();
    }
  }

  filterPaste(event: ClipboardEvent) {
    if (!event.clipboardData.getData('text').match(this.filterPasteRegex)) {
      event.preventDefault();
    }
  }

  increment() {

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

  constructor(private cdRef: ChangeDetectorRef) {
    this.decimal = new SimpleDecimal(this.maxDecimalPlaces);
    this.keyManager = new SpinnerKeyManager(this);
  }

  ngOnInit() {  }

  writeValue(value: number): void {
    if (value !== null) {
      this.value = value;
    }
  }

  registerOnChange(fn: () => void): void {

  }

  registerOnTouched(fn: () => void): void {  }

  setDisabledState?(isDisabled: boolean): void {  }
}
