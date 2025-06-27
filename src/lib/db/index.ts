import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'

import { DB as CommentariesDB } from './commentaries.types'
import { DB } from './types'

const sqlite3Options: SQLite.Options = {
  fileMustExist: true
}

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new SQLite(process.env.DATABASE_URL, sqlite3Options)
  })
})

export const commentariesDb = new Kysely<CommentariesDB>({
  dialect: new SqliteDialect({
    database: new SQLite(process.env.DATABASE_COMMENTARIES_URL, sqlite3Options)
  })
})
