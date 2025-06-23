import path, { dirname } from 'node:path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { $, fs as fszx, useBash, question, chalk, glob } from 'zx'
import { LogEntry, log } from 'zx/core'

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

type Registry = {
  url: string
  file_name: string
  description: string
  modules: [
    {
      download_url: string
      file_name: string
      language_code: string
      description: string
      update_date: string
      update_info: string
    }
  ]
}
const ROOT_PATH = path.resolve()
const TLB_MODULES_REGISTRY_PATH = path.resolve(
  ROOT_PATH,
  'data',
  'tlb-modules.registry.json'
)
const DATA_PATH = path.resolve(ROOT_PATH, 'data')

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .options({
      message: {
        alias: 'm',
        type: 'string',
        description: 'Mensagem de atualização do bundle',
        demandOption: true
      }
    })
    .parse()

  const registry = (await fszx.readJSON(TLB_MODULES_REGISTRY_PATH)) as Registry

  const newRegistry: Registry = {
    ...registry,
    modules: [
      {
        ...registry.modules[0],
        update_info: argv.message,
        update_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
      }
    ]
  }

  console.log(chalk.blue('Novos metadados do bundle:'))
  console.log(chalk.green(JSON.stringify(newRegistry, null, 2)))

  const confirmation = await question(
    chalk.blue('Você deseja proceder com a geração do bundle? (y/n): ')
  )

  if (confirmation.toLowerCase() !== 'y') {
    console.log(chalk.bgRedBright('Operação cancelada.'))
    return
  }

  console.log(chalk.blue('Atualizando metadados do bundle...'))
  await fszx.writeJSON(TLB_MODULES_REGISTRY_PATH, newRegistry, {
    spaces: 2,
    EOL: '\n'
  })

  const bundleZipPath = path.resolve(ROOT_PATH, 'out', 'TLB.zip')
  const bundleFiles = glob.sync(path.join(DATA_PATH, '*.SQLite3'))

  await fszx.ensureDir(dirname(bundleZipPath))

  console.log(chalk.blue('Criando o arquivo zip do bundle...'))

  await $`zip -j ${bundleZipPath} ${bundleFiles}`.verbose().nothrow()

  console.log(chalk.green(`Bundle criado com sucesso em: ${bundleZipPath}`))
}

main()
