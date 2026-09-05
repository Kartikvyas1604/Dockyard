type Level = "debug" | "info" | "warn" | "error";

const PREFIX = "[dockyard]";

function emit(level: Level, args: unknown[]): void {
  const fn = level === "debug" ? console.debug : level === "error" ? console.error : console.log;
  fn(PREFIX, level, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => emit("debug", args),
  info: (...args: unknown[]) => emit("info", args),
  warn: (...args: unknown[]) => emit("warn", args),
  error: (...args: unknown[]) => emit("error", args),
};
