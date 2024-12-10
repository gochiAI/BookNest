# Book Nest
このプロジェクトは、書籍の管理を行うためのNuxtアプリケーションです。

## 主なディレクトリとファイル

- `components/`: Vueコンポーネントを格納
- `config/`: 設定ファイルを格納
- `constants/`: 定数を格納
- `i18n/`: 国際化対応のためのファイルを格納
- `interfaces/`: TypeScriptのインターフェースを格納
- `layouts/`: レイアウトコンポーネントを格納
- `pages/`: ページコンポーネントを格納
- `prisma/`: Prismaの設定とマイグレーションファイルを格納
- `server/`: サーバーサイドのコードを格納
- `nuxt.config.ts`: Nuxtの設定ファイル
- `tailwind.config.js`: Tailwind CSSの設定ファイル

## Document
- [components](./docs/components.md)
- [layouts](./docs/layouts.md)
- [api](./docs/api.md)



## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
