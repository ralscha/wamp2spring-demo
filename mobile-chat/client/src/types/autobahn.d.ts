interface AutobahnSubscription {
  readonly id?: number;
}

interface AutobahnSession {
  call<TResult>(procedure: string, args?: unknown[]): Promise<TResult>;
  subscribe<TArgs = unknown[], TKwargs = Record<string, unknown>>(
    topic: string,
    handler: (args: TArgs, kwargs: TKwargs) => void,
  ): Promise<AutobahnSubscription>;
  unsubscribe(subscription: AutobahnSubscription): void;
  publish(
    topic: string,
    args: unknown[],
    kwargs?: Record<string, unknown>,
    options?: { acknowledge?: boolean; exclude_me?: boolean },
  ): Promise<void> | void;
}

interface AutobahnConnection {
  onopen?: (session: AutobahnSession, details: unknown) => void;
  onclose?: (reason?: unknown, details?: unknown) => boolean;
  open(): void;
  close(): void;
}

declare module 'autobahn-browser' {
  const autobahn: {
    Connection: new (options: { url: string; realm: string }) => AutobahnConnection;
  };

  export default autobahn;
}
