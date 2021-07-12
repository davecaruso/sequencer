yarn esbuild --bundle .\backend\index.ts --outfile=dist/backend.js --platform=node --external:electron
yarn electron .\dist\backend.js
