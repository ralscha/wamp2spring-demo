export interface AppEnvironment {
  httpBaseUrl: string;
  wsBaseUrl: string;
}

export const APP_ENVIRONMENT: AppEnvironment = {
  httpBaseUrl: 'http://localhost:8080',
  wsBaseUrl: 'ws://localhost:8080',
};
