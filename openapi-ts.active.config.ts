import { defineConfig } from '@hey-api/openapi-ts'
export default defineConfig({
  input: 'https://active.nbtca.space/openapi.json',
  output: {
    path: './src/utils/active',
    format: 'prettier',
    lint: 'eslint',
  },
  client: 'legacy/fetch',
  types: {
    dates: true,
    enums: 'typescript+namespace',
    name: 'PascalCase',
    tree: false,
  },
  services: {
    response: 'body',
  },
  schemas: false,
  name: 'ApiClient',
})
