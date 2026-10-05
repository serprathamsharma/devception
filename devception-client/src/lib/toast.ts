type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
  durationMs?: number;
  type?: ToastType;
}

/**
 * Lightweight, non-intrusive notification dispatcher.
 * Dispatches custom events that UI notification listeners can subscribe to.
 */
export function showToast(message: string, options: ToastOptions = {}): void {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('devception:toast', {
    detail: {
      message,
      type: options.type ?? 'info',
      durationMs: options.durationMs ?? 3000,
      timestamp: Date.now(),
    },
  });

  window.dispatchEvent(event);
}
