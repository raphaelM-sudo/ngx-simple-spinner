export interface IInteractiveSpinner {
  add(event: Event, once?: boolean): void;
  subtract(event: Event, once?: boolean): void;
}
