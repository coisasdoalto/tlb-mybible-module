import { chalk, fs as fszx } from '@/lib/zx'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME

export async function uploadToR2(filePath: string, key: string) {
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
