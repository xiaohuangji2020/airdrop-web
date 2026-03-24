---
name: code_style
description: Code style and conventions used in airdrop-web
type: project
---

# Code Style & Conventions

- **Language**: JavaScript with JSX (not TypeScript, despite TS types in devDeps)
- **File extensions**: `.jsx` for React components, `.css` for styles
- **Component style**: Functional components with hooks (`useState`, `useRef`, etc.)
- **Export style**: `export default function ComponentName()`
- **Naming**: PascalCase for components, camelCase for variables/functions
- **CSS**: Separate `.css` files per page, co-located with page files in `src/pages/`
- **Component decomposition**: Sub-components in `src/components/<PageName>/` folder
- **No TypeScript**: Project uses JSX not TSX despite typescript devDependencies listed
