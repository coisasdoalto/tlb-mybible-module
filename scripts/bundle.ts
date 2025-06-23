import path, { basename, dirname } from 'node:path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { $, fs as fszx, useBash, question, chalk, glob } from 'zx'
import { LogEntry, log } from 'zx/core'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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
const OUT_PATH = path.resolve(ROOT_PATH, 'out')

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME

async function uploadToR2(filePath: string, key: string) {
  console.log(chalk.blue(`Fazendo upload de ${filePath} para ${key}...`))

  try {
    const fileContent = await fszx.readFile(filePath)

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: key.endsWith('.json')
        ? 'application/json'
        : 'application/zip'
    }

    await r2Client.send(new PutObjectCommand(uploadParams))
    console.log(chalk.green(`Upload de ${key} concluído com sucesso!`))
  } catch (error) {
    console.error(chalk.red(`Erro ao fazer upload de ${key}:`), error)
    throw error
  }
}

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

  const bundleZipPath = path.resolve(OUT_PATH, 'TLB.zip')
  const bundleFiles = glob.sync(path.join(DATA_PATH, '*.SQLite3'))

  await fszx.ensureDir(dirname(bundleZipPath))

  console.log(chalk.blue('Criando o arquivo zip do bundle...'))

  await $`zip -j ${bundleZipPath} ${bundleFiles}`.verbose().nothrow()

  console.log(chalk.green(`Bundle criado com sucesso em: ${bundleZipPath}`))

  try {
    await uploadToR2(
      TLB_MODULES_REGISTRY_PATH,
      basename(TLB_MODULES_REGISTRY_PATH)
    )

    await uploadToR2(bundleZipPath, basename(bundleZipPath))

    console.log(chalk.green('Upload para R2 concluído com sucesso!'))
  } catch (error) {
    console.error(chalk.red('Erro ao realizar upload para R2:'), error)
  }
}

main()
