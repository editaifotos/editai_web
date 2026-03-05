export const logger = {
  info(message: string, meta?: unknown) {
    // eslint-disable-next-line no-console
    console.log(message, meta);
  },
  warn(message: string, meta?: unknown) {
    // eslint-disable-next-line no-console
    console.warn(message, meta);
  },
  error(message: string, meta?: unknown) {
    // eslint-disable-next-line no-console
    console.error(message, meta);
  }
};

