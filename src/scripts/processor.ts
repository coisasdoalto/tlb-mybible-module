import fs from 'node:fs'
import path from 'node:path'

import { stringify } from 'csv'
import Progress from 'progress'

import { db } from '@/lib/db'
import { chalk } from '@/lib/zx'
import { DeepNonNullable } from '@/types'

const ROOT_PATH = path.resolve()
const DATA_PATH = path.resolve(ROOT_PATH, 'data')

async function main() {
  const versesResult = await db
    .selectFrom('verses')
    .innerJoin('books', 'books.book_number', 'verses.book_number')
    .select([
      'verses.book_number',
      'verses.chapter',
      'verses.verse',
      'verses.text',
      'books.short_name as book_short_name'
    ])
    .execute()

  const verses = versesResult as DeepNonNullable<
    (typeof versesResult)[number]
  >[]

  const updatesFileStream = fs.createWriteStream(
    path.resolve(DATA_PATH, 'updates.csv')
  )

  const stringifyStream = stringify({
    header: true,
    columns: {
      book: 'Livro',
      chapter: 'Capítulo',
      verse: 'Verso',
      before: 'Antes',
      after: 'Depois'
    }
  })

  stringifyStream.pipe(updatesFileStream)

  const progress = new Progress('Processando :rate/s [:bar] :percent :etas', {
    total: verses.length,
    clear: true,
    width: 20,
    complete: '=',
    incomplete: ' '
  })

  let totalUpdates = 0

  for (const verse of verses) {
    const processedText = verse.text
      .replace(/<i>/g, '<n>[')
      .replace(/<\/i>/g, ']</n>')

    if (processedText === verse.text) {
      progress.tick()
      continue
    }

    await db
      .updateTable('verses')
      .set({ text: processedText })
      .where('book_number', '=', verse.book_number)
      .where('chapter', '=', verse.chapter)
      .where('verse', '=', verse.verse)
      .execute()

    stringifyStream.write({
      book: verse.book_short_name,
      chapter: verse.chapter,
      verse: verse.verse,
      before: verse.text,
      after: processedText
    })

    totalUpdates += 1

    progress.tick()
  }

  stringifyStream.end()

  if (totalUpdates === 0) {
    console.log(chalk.green('Nenhuma atualização feita.'))
    return
  }

  console.log(chalk.blue(`Total de atualizações: ${totalUpdates}`))

  updatesFileStream.on('finish', () => {
    console.log(chalk.green('Arquivo de atualizações gerado: updates.csv'))
  })
}

main()
