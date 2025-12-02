type EventName = 'books:changed';

const emitter = new EventTarget();

export function on(event: EventName, handler: (e: CustomEvent<any>) => void) {
  emitter.addEventListener(event, handler as EventListener);
}

export function off(event: EventName, handler: (e: CustomEvent<any>) => void) {
  emitter.removeEventListener(event, handler as EventListener);
}

export function emit(event: EventName, detail?: any) {
  const ev = new CustomEvent(event, { detail });
  emitter.dispatchEvent(ev);
}
