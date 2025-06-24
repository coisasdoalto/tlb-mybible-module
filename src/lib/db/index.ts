import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'

import { DB as CommentariesDB } from './commentaries.types'
import { DB } from './types'

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: new SQLite(process.env.DATABASE_URL)
  })
})

export const commentariesDb = new Kysely<CommentariesDB>({
  dialect: new SqliteDialect({
    database: new SQLite(process.env.DATABASE_COMMENTARIES_URL)
  })
})
