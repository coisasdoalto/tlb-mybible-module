import { $ } from '@/lib/zx'

function main() {
  $.sync`npx kysely-codegen --out-file ./src/lib/db/types.d.ts`
  $.sync`npx kysely-codegen --out-file ./src/lib/db/commentaries.types.d.ts --url $DATABASE_COMMENTARIES_URL`
}

main()
