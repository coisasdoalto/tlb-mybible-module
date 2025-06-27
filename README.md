# tlb-mybible-module

MyBible.Zone TLB (Tradução Literal da Bíblia) module with footnotes and 'inserted words' highlights.

## Converting USFM to MyBible module

Put USFM files in the `tlb-paratext` folder.

Download [BibleMultiConverter](https://github.com/schierlm/BibleMultiConverter) to `dist` folder and run the following command to convert USFM files to MyBible module:

```shell
java -jar ./dist/<BibleMultiConverter-version>/BibleMultiConverter-SQLiteEdition.jar USFM ./tlb-paratext/ MyBibleZone ./data
```

Run post-conversion script to update database types, update database info, and process text:

```shell
pnpm post-conversion
```

## Generating bundle and uploading

This repository includes a script for creating the bundle and uploading it to Cloudflare R2.

### Configuration

1. Create a `.env` file in the project root (use `.env.example` as reference):

   ```shell
   cp .env.example .env
   ```

   Or [setup doppler](https://docs.doppler.com/docs/install-cli) and run:

   ```shell
   doppler secrets download --no-file --format env > .env
   ```

2. Run the script:

   ```
   pnpm bundle -m "Update message"
   ```

Options:

- `-m, --message`: Bundle update message (required)

### Files uploaded to R2

- `tlb-modules.registry.json`: Modules registry file
- `TLB-pt.zip`: Bundle containing TLB SQLite3 files

## Post-conversion script

This script runs other scripts that should be executed to maintain the consistency of MyBible module.

- `types` script: Runs `kysely-codegen` to update the database types.
- `info` script: Updates `info` tables (replaced whenever BibleMultiConverter is run) for main and commentaries modules, including `chapter_string`, `introduction_string`, `language`, and `description`.
- `process-text` script: Processes the text and applies any necessary transformations. Current transformations include:
  - Replaces `<i>text</i>` to `<n>[text]</n>`.

## Copyright

### English

The biblical text present in this repository (contained in `.SQLite3` files or any other files) is subject to copyright. The content is protected and may not be reproduced, distributed, or used without explicit permission from the copyright holders. For more information, visit [https://traducaoliteral.com.br/copyright](https://traducaoliteral.com.br/copyright) or contact the author or project maintainer.

### Português

O texto bíblico presente neste repositório (contido nos arquivos `.SQLite3`, ou quaisquer outros arquivos) está sujeito a direitos autorais. O conteúdo é protegido e não pode ser reproduzido, distribuído ou utilizado sem permissão explícita dos detentores dos direitos autorais. Para mais informações, visite [https://traducaoliteral.com.br/copyright](https://traducaoliteral.com.br/copyright) ou entre em contato com o autor ou mantenedor do projeto.
