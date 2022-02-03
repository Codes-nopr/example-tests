import Logger from "./logger"

["multipleResolves", "rejectionHandled", "uncaughtException", "uncaughtExceptionMonitor", "unhandledRejection"]
.forEach((error) => process.on(error, () => Logger.red(error)));
