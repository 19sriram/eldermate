export type NotifyTarget = { name: string; phone: string };

export interface Notifier {
  send(target: NotifyTarget, message: string): Promise<void>;
}

class ConsoleNotifier implements Notifier {
  async send(target: NotifyTarget, message: string) {
    console.log(`[notify] -> ${target.name} (${target.phone}): ${message}`);
  }
}

// Swap in SMS / WhatsApp implementations here, selected by env NOTIFIER.
export function getNotifier(): Notifier {
  switch (process.env.NOTIFIER ?? "console") {
    case "console":
    default:
      return new ConsoleNotifier();
  }
}
