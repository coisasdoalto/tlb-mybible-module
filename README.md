# tlb-mybible-module

MyBible.Zone TLB (Tradução Literal da Bíblia) module with footnotes and 'inserted words' highlights.

## Converting USFM to MyBible module

Download [BibleMultiConverter](https://github.com/schierlm/BibleMultiConverter).

`java -jar BibleMultiConverter-SQLiteEdition.jar USFM ../tlb-paratext/ MyBibleZone ../export`

## Generating bundle and uploading

This repository includes a script for creating the bundle and uploading it to Cloudflare R2.

### Configuration

1. Create a `.env` file in the project root (use `.env.example` as reference):

   ```shell
   cp .env.example .env
   ```

2. Run the script:

   ```
   pnpm bundle -m "Update message"
   ```

Options:

- `-m, --message`: Bundle update message (required)

### Files uploaded to R2

- `tlb-modules.registry.json`: Modules registry file
- `TLB.zip`: Bundle containing TLB SQLite3 files

## Copyright

### English

The biblical text present in this repository (contained in `.SQLite3` files or any other files) is subject to copyright. The content is protected and may not be reproduced, distributed, or used without explicit permission from the copyright holders. For more information, visit [https://traducaoliteral.com.br/copyright](https://traducaoliteral.com.br/copyright) or contact the author or project maintainer.

### Português

O texto bíblico presente neste repositório (contido nos arquivos `.SQLite3`, ou quaisquer outros arquivos) está sujeito a direitos autorais. O conteúdo é protegido e não pode ser reproduzido, distribuído ou utilizado sem permissão explícita dos detentores dos direitos autorais. Para mais informações, visite [https://traducaoliteral.com.br/copyright](https://traducaoliteral.com.br/copyright) ou entre em contato com o autor ou mantenedor do projeto.
