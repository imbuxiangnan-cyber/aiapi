import consola, { LogLevels } from "consola"

export type LogLevel = "debug" | "info" | "warn" | "error"

export interface LoggerConfig {
  level: LogLevel
  json: boolean
}

const levelMap: Record<LogLevel, number> = {
  debug: LogLevels.debug,
  info: LogLevels.info,
  warn: LogLevels.warn,
  error: LogLevels.error,
}

export function configureLogger(config: Partial<LoggerConfig> = {}) {
  const level = config.level ?? (process.env.LOG_LEVEL as LogLevel) ?? "info"

  consola.level = levelMap[level] ?? LogLevels.info

  if (config.json || process.env.LOG_FORMAT === "json") {
    consola.options.formatOptions = {
      columns: 0,
      colors: false,
      compact: true,
      date: true,
    }
  }
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => {
    consola.debug(data ? { msg, ...data } : msg)
  },
  info: (msg: string, data?: Record<string, unknown>) => {
    consola.info(data ? { msg, ...data } : msg)
  },
  warn: (msg: string, data?: Record<string, unknown>) => {
    consola.warn(data ? { msg, ...data } : msg)
  },
  error: (msg: string, data?: Record<string, unknown>) => {
    consola.error(data ? { msg, ...data } : msg)
  },
}
