import { db } from '@/lib/db'
import { chalk } from '@/lib/zx'

async function main() {
  const versesCount = await db
    .selectFrom('verses')
    .select(db.fn.countAll().as('count'))
    .executeTakeFirstOrThrow()

  console.log(chalk.blue('Total de versículos:'), versesCount.count)
}

main()
