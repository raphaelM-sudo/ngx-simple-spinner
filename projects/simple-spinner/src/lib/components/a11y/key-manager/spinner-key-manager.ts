import { IInteractiveSpinner } from '../../../models/interactive-spinner.model';

export class SpinnerKeyManager {

  constructor(private spinner: IInteractiveSpinner) { }

  catchKey(event: KeyboardEvent) {
    const key = event.key;

    if (key) {
      switch (key) {
        case 'ArrowUp':
          this.spinner.add(true);
          break;
        case 'ArrowDown':
          this.spinner.subtract(true);
          break;
        default:
          return;
      }

      // Prevent only for keys, because of a firefox css :active bug on buttons
      event.preventDefault();
    }
  }
}
