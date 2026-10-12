# QuickTask

A focused, responsive task list built with Vite and React. Add tasks by button or Enter, toggle completion, delete items, and keep your list in this browser with LocalStorage.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```sh
cd frontend
npm install
npm run dev
```

## Verify

```sh
cd frontend
npm test
npm run build
npm run e2e
```

The E2E suite uses Playwright Chromium. Install its browser once with `node node_modules/@playwright/test/cli.js install chromium` if it is not already available.

All task data stays in the current browser's LocalStorage. There is no account, backend, or synchronization service.
