import { diffJson as diffJsonLib } from 'diff'

import { chalk } from '@/lib/zx'

export function diffJson(oldStr: string, newStr: string) {
  const diff = diffJsonLib(oldStr, newStr)

  return diff.reduce((acc, part) => {
    if (part.added) {
      return acc + chalk.green(part.value)
    }

    if (part.removed) {
      return acc + chalk.red(part.value)
    }
    return acc + part.value
  }, '')
}
