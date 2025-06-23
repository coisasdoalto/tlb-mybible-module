import { $, useBash, chalk } from 'zx'
import { log, LogEntry } from 'zx/core'

useBash()

$.log = (entry: LogEntry) => {
  switch (entry.kind) {
    case 'stdout':
      process.stdout.write(chalk.gray(entry.data))
      break
    default:
      log(entry)
  }
}

export * from 'zx'
