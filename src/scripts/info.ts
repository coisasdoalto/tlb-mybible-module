import path from 'node:path'

import { commentariesDb, db } from '@/lib/db'
import { chalk } from '@/lib/zx'
import { DeepNonNullable } from '@/types'

const BIBLE_INFO = {
  chapter_string: 'Capítulo',
  introduction_string: 'Introdução',
  language: 'pt',
  description: 'Tradução Literal da Bíblia'
}

const COMMENTARIES_INFO = {
  language: 'pt',
  description: 'Notas de rodapé da Tradução Literal da Bíblia'
}

async function setDbInfo() {
  for (const [name, value] of Object.entries(BIBLE_INFO)) {
    await db
      .updateTable('info')
      .set({ value })
      .where('name', '=', name)
      .execute()
  }

  for (const [name, value] of Object.entries(COMMENTARIES_INFO)) {
    await commentariesDb
      .updateTable('info')
      .set({ value })
      .where('name', '=', name)
      .execute()
  }
}

async function setLongBookNames() {
  const longBookNamesResult = await db
    .selectFrom('stories')
    .select(['title', 'book_number'])
    .execute()

  const longBookNames = longBookNamesResult as DeepNonNullable<
    (typeof longBookNamesResult)[number]
  >[]

  const capitalizedLongBookNames = longBookNames.map(story => {
    return {
      long_name: story.title
        .split(' ')
        .map(word => word.toLowerCase())
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      book_number: story.book_number
    }
  })

  for (const { long_name, book_number } of capitalizedLongBookNames) {
    await db
      .updateTable('books')
      .set({ long_name })
      .where('book_number', '=', book_number)
      .execute()
  }

  await db.deleteFrom('stories').execute()
}

async function main() {
  await setDbInfo()
  console.log(chalk.green('Informações atualizadas!'))

  await setLongBookNames()
  console.log(chalk.green('Nomes dos livros atualizados!'))
}

main()
