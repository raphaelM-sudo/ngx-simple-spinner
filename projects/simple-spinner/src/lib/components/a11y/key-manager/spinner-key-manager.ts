import { IInteractiveSpinner } from '../../../models/interactive-spinner.model';

export class SpinnerKeyManager {

  constructor(private spinner: IInteractiveSpinner) { }

  catchKey(event: KeyboardEvent) {
    const key = event.key;

    if (key) {
      switch (key) {
        case 'ArrowUp':
          this.spinner.add(event, true);
          break;
        case 'ArrowDown':
          this.spinner.subtract(event, true);
          break;
        default:
          return;
      }
    }
  }
}
