import { Renderer2 } from '@angular/core';
import { NumberFormatService } from './number-format.service';

/**
 * Handles keyboard, input, focus, and model events for a formatted number
 * input element.
 *
 * The handler applies the configured number format, maintains the caret when
 * separators are inserted or removed, and synchronizes the input with an
 * Angular forms model.
 */
export class InputHandler {
  private _nfs: NumberFormatService;
  private _onModelChange!: Function;
  private _onModelTouched!: Function;

  private _formElement: HTMLInputElement;
  private _renderer: Renderer2;
  private _triggerBackspace: boolean = false;
  private _triggerDelete: boolean = false;

  private _pastSelectionStart!: number;
  private _pastValue!: string;
  private _pastValueDOM!: string;

  private _rawFormat!: string;
  private _formatComma!: boolean;
  private _maxDigit!: number;
  private _maxDecimal!: number;
  private _allowNegative: boolean = false;

  private _regEx!: RegExp;
  private _regExNumber: RegExp = /^\d*$/g;
  private _regExNumberAndDecimal: RegExp = /^\d+(\.\d*){0,1}$/g;
  private _regExNumberNegative: RegExp = /^-?\d*$/g;
  private _regExNumberAndDecimalNegative: RegExp = /^-?\d+(\.\d*){0,1}$/g;

  constructor(formElement: HTMLInputElement, renderer: Renderer2) {
    this._nfs = new NumberFormatService();
    this._formElement = formElement;
    this._renderer = renderer;
  }

  /** Returns the callback used to notify the Angular forms model of changes. */
  getOnModelChange(): Function {
    return this._onModelChange;
  }

  /** Sets the callback used to notify the Angular forms model of changes. */
  setOnModelChange(callbackFunction: Function): void {
    this._onModelChange = callbackFunction;
  }

  /** Returns the callback used to notify the Angular forms model that the input was touched. */
  getOnModelTouched(): Function {
    return this._onModelTouched;
  }

  /** Sets the callback used to notify the Angular forms model that the input was touched. */
  setOnModelTouched(callbackFunction: Function): void {
    this._onModelTouched = callbackFunction;
  }

  /** Configures the number format and derives its digit and decimal limits. */
  setFormat(format: string): void {
    if (!format) {
      return;
    }

    this._rawFormat = format;
    this._formatComma = this._nfs.detectComma(format);
    this.setMaxDigitAndMaxDecimal(this._nfs.removeComma(format));
  }

  /** Enables or disables negative values and updates validation accordingly. */
  setAllowNegative(allowNegative: boolean): void {
    this._allowNegative = allowNegative;
    if (this._rawFormat) {
      this.setMaxDigitAndMaxDecimal(this._nfs.removeComma(this._rawFormat));
    }
  }

  /** Processes keyboard input before the browser updates the input value. */
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== ',' && event.key !== '-') {
      this._triggerBackspace = this.manageBackspaceKey(event);
      this._triggerDelete = this.manageDeleteKey(event);

      if (this._nfs.isSpecialKey(event)) {
        return;
      }

      if (
        event.key === '.' &&
        this._nfs.getLastCharacterFromCursorAtBackDirection(this._formElement) === '.' &&
        this._nfs.isCursorAtSamePlace(this._formElement) &&
        this._formElement.selectionEnd
      ) {
        this.setCursorAt(this._formElement.selectionEnd + 1);
        event.preventDefault();
        return;
      }

      if (this.validateByRegEx(event.key)) {
        this.setPastValue();
        if (
          ((this._formElement.selectionStart === 0 && this._formElement.selectionEnd === 0) ||
            (this._formElement.selectionStart === 1 && this._formElement.selectionEnd === 1)) &&
          this._nfs.getNumericPart(this._nfs.getRawValue(this._formElement.value)) == '0'
        ) {
          event.preventDefault();
          this.processFirstNumberWhenValueAtZero(event);
        } else if (
          this._nfs.isCursorAtSamePlace(this._formElement) &&
          this._nfs.detectDecimalPoint(this._formElement.value.substring(0, this._formElement.selectionStart!)) &&
          this._nfs.detectDecimalPoint(this._formElement.value) &&
          this._formElement.selectionStart! < this._formElement.value.length
        ) {
          event.preventDefault();
          this.processDecimalValue(event);
        }
      } else {
        event.preventDefault();
      }
    } else if (event.key === '-' && this._allowNegative) {
      if (!this._formElement.value) {
        this.setFormElementProperty(['value', '-']);
      } else if (
        this._formElement.selectionStart === 0 &&
        this._formElement.selectionEnd === this._formElement.value.length
      ) {
        this.setFormElementProperty(['value', '-']);
        this._onModelChange('');
      } else if (
        this._nfs.isCursorAtSamePlace(this._formElement) &&
        this._formElement.selectionStart === 0 &&
        !this._nfs.detectMinusSignOnFirst(this._formElement.value)
      ) {
        let value = '-' + this._formElement.value;
        this.applyMask(value);
        this._onModelChange(this._nfs.getRawValue(value));
        this.setCursorAt(1);
      }
      event.preventDefault();
    } else {
      event.preventDefault();
    }
  }

  /** Stores the current value and caret position before a click changes them. */
  handleClick(event: Event): void {
    this.setPastValue(event);
  }

  /** Validates and formats a value after the browser has updated the input. */
  handleInput(event: Event): void {
    let value = (<HTMLInputElement>event.target).value;
    if (
      (value && !Number(this._nfs.removeComma(value)).toString().match(this._regEx)) ||
      value.substring(0, 2) === '-0' ||
      value.substring(0, 2) === '-.'
    ) {
      this.setFormElementProperty(['value', '']);
      this._onModelChange('');
    } else {
      if (this._triggerBackspace || this._triggerDelete) {
        this._pastSelectionStart = this._formElement.selectionStart! - 1;
        this._pastValue = this._formElement.value;
      }
      this.processCursorPosition(this.applyMask(value));
      this._onModelChange(this._nfs.getRawValue(value));
    }
  }

  /** Completes the decimal value and marks the input as touched. */
  handleBlur(event: Event): void {
    let value = (<HTMLInputElement>event.target).value;
    if (value.length > 0 && value !== '-') {
      this.setFormElementProperty(['value', this._nfs.autoFillDecimal(value, this._maxDecimal, this._formatComma)]);
    } else if ((value = '-')) {
      this.setFormElementProperty(['value', '']);
    }
    this._onModelTouched();
    if (value != this._pastValueDOM) {
      this.fixBugOnMicrosoftEdgeAndIE(event);
    }
  }

  /** Writes and formats an external model value into the input element. */
  handleWriteValue(value: string | number): void {
    if (value != null && value !== '') {
      let valStr = '';
      if (typeof value === 'string') {
        valStr = this._nfs.removeComma(value);
      } else if (typeof value === 'number') {
        valStr = value.toString();
      }
      this.applyMask(valStr);
    } else if (typeof value === 'object' || typeof value === 'string') {
      this.setFormElementProperty(['value', value]);
    }
  }

  /** Applies the configured number mask and updates the input element. */
  applyMask(value: string): string {
    if (value) {
      value = this._nfs.getRawValue(value);
      value = this._nfs.autoFillDecimal(value, this._maxDecimal, this._formatComma);
    }
    this.setFormElementProperty(['value', value]);
    return value;
  }

  private fixBugOnMicrosoftEdgeAndIE(event: Event): void {
    let isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
      let evt = new Event('change', { bubbles: false, cancelable: true });
      event.target?.dispatchEvent(evt);
    }
  }

  private manageBackspaceKey(event: KeyboardEvent): boolean {
    if (event.key === 'Backspace') {
      let char = this._nfs.getLastCharacterFromCursorAtFrontDirection(this._formElement);
      if (this._nfs.isCursorAtSamePlace(this._formElement) && (char === ',' || char === '.')) {
        this.setCursorAt(this._formElement.selectionStart! - 1);
        event.preventDefault();
      }
      return true;
    }
    return false;
  }

  private manageDeleteKey(event: KeyboardEvent): boolean {
    if (event.key === 'Delete') {
      let char = this._nfs.getLastCharacterFromCursorAtBackDirection(this._formElement);
      if (this._nfs.isCursorAtSamePlace(this._formElement) && (char === ',' || char === '.')) {
        this.setCursorAt(this._formElement.selectionEnd! + 1);
        event.preventDefault();
      }
      return true;
    }
    return false;
  }

  private processCursorPosition(value: string): void {
    let pastValue = this._pastValue.substring(0, this._pastSelectionStart);
    let pastTotalComma = (pastValue.match(/,/g) || []).length;
    let newValue = value.substring(0, this._pastSelectionStart + 1);
    let newTotalComma = (newValue.match(/,/g) || []).length;
    this.setCursorAt(this._pastSelectionStart + 1 + (newTotalComma - pastTotalComma));
  }

  private processDecimalValue(event: KeyboardEvent): void {
    let selectionStart = this._formElement.selectionStart!;
    let newValue =
      this._formElement.value.substring(0, selectionStart) +
      event.key +
      this._formElement.value.substring(selectionStart + 1);
    this.setFormElementProperty(['value', newValue]);
    this._onModelChange(this._nfs.getRawValue(newValue));
    this.setCursorAt(selectionStart + 1);
  }

  private processFirstNumberWhenValueAtZero(event: KeyboardEvent): void {
    let newValue = event.key + this._nfs.getDecimalPart(this._formElement.value);
    this.setFormElementProperty(['value', newValue]);
    this._onModelChange(newValue);
    this.setCursorAt(1);
  }

  private setCursorAt(position: number): void {
    if (this._formElement.setSelectionRange) {
      this._formElement.focus();
      this._formElement.setSelectionRange(position, position);
    }
  }

  private setFormElementProperty([name, value]: [string, string | boolean]): void {
    this._renderer.setProperty(this._formElement, name, value);
  }

  private setMaxDigitAndMaxDecimal(value: string): void {
    if (this._nfs.detectDecimalPoint(value)) {
      let splitValue = value.split('.');
      this._maxDigit = splitValue[0].length;
      this._maxDecimal = splitValue[1].length;
      this._regEx = this._allowNegative ? this._regExNumberAndDecimalNegative : this._regExNumberAndDecimal;
    } else {
      this._maxDecimal = 0;
      this._maxDigit = value.length;
      this._regEx = this._allowNegative ? this._regExNumberNegative : this._regExNumber;
    }
  }

  private setPastValue(event?: Event): void {
    this._pastSelectionStart = this._formElement.selectionStart!;
    this._pastValue = this._formElement.value;
    if (event) {
      this._pastValueDOM = (<HTMLInputElement>event.target).value;
    }
  }

  private validateByRegEx(key: string): boolean {
    let current = this._formElement.value;
    let firstPart = current.substring(0, this._formElement.selectionStart!);
    if (this._allowNegative && this._nfs.detectMinusSignOnFirst(firstPart)) {
      firstPart = this._nfs.removeMinusSign(firstPart);
    }
    let positionForSecondPart =
      this._nfs.detectDecimalPoint(current) && this._nfs.detectDecimalPoint(firstPart)
        ? this._formElement.selectionEnd! + 1
        : this._formElement.selectionEnd!;
    let secondPart = current.substring(positionForSecondPart);
    let next = this._nfs.removeComma(firstPart.concat(key) + secondPart);

    let value = next.split('.');
    let minusSign =
      this._allowNegative &&
      key === '-' &&
      this._formElement.selectionStart === 0 &&
      this._formElement.selectionEnd === 0 &&
      !this._nfs.detectMinusSignOnFirst(current);
    if (
      ((next && !String(next).match(this._regEx)) ||
        (value[0].length > this._maxDigit && this._formElement.selectionStart === this._formElement.selectionEnd) ||
        (this._maxDecimal > 0 &&
          value.length === 2 &&
          value[1].length > this._maxDecimal &&
          this._formElement.selectionStart === this._formElement.selectionEnd)) &&
      !minusSign
    ) {
      return false;
    }
    return true;
  }
}
