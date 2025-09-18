# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command                 | Action                                           |
| :---------------------- | :----------------------------------------------- |
| `pnpm install`          | Installs dependencies                            |
| `pnpm run dev`          | Starts local dev server                          |
| `pnpm run build`        | Build your production site to `./dist/`          |
| `pnpm run preview`      | Preview your build locally, before deploying     |
| `pnpm run lint`         | Run ESLint for code linting                      |
| `pnpm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro --help` | Get help using the Astro CLI                     |

## Code Structure

- **src/components**: Contains reusable UI components (Astro, React, Vue).
- **src/pages**: Contains page-level components and routes.
- **src/layouts**: Contains layout components for different page types.
- **src/utils**: Utility functions and helpers.
- **src/types**: TypeScript type definitions.
- **src/styles**: Global styles and Tailwind configuration.

## Key Technologies

- **Astro**: Static site generator.
- **React/Vue**: UI frameworks used for interactive components.
- **TailwindCSS**: Utility-first CSS framework.
- **ESLint**: JavaScript/TypeScript linting.
- **TypeScript**: Static typing for JavaScript.

## Notes

- The project uses `pnpm` as the package manager.
- Pre-commit hooks (via Husky) run ESLint on staged files.
- OpenAPI types are generated using `openapi-typescript`.