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

  const updates: {
    book: string
    chapter: number
    verse: number
    before: string
    after: string
  }[] = []

  const updatesFileStream = fs.createWriteStream(
    path.resolve(DATA_PATH, 'updates.csv'),
    { flags: 'w' }
  )

  const progress = new Progress('Processando :rate/s [:bar] :percent :etas', {
    total: verses.length,
    clear: true,
    width: 20,
    complete: '=',
    incomplete: ' '
  })

  for (const verse of verses) {
    const processedText = verse.text
      .replace(/<i>/g, '<n>[')
      .replace(/<\/i>/g, ']</n>')

    if (processedText === verse.text) {
      progress.tick()
      continue
    }

    updates.push({
      book: verse.book_short_name,
      chapter: verse.chapter,
      verse: verse.verse,
      before: verse.text,
      after: processedText
    })

    await db
      .updateTable('verses')
      .set({ text: processedText })
      .where('book_number', '=', verse.book_number)
      .where('chapter', '=', verse.chapter)
      .where('verse', '=', verse.verse)
      .execute()

    progress.tick()
  }

  if (updates.length === 0) {
    console.log(chalk.green('Nenhuma atualização feita.'))
    return
  }

  console.log(chalk.blue(`Total de atualizações: ${updates.length}`))

  stringify(updates, {
    header: true,
    columns: {
      book: 'Livro',
      chapter: 'Capítulo',
      verse: 'Verso',
      before: 'Antes',
      after: 'Depois'
    }
  }).pipe(updatesFileStream)

  updatesFileStream.on('finish', () => {
    console.log(chalk.green('Arquivo de atualizações gerado: updates.csv'))
  })
}

main()
