npx yarn esbuild --bundle .\backend\index.ts --outfile=dist/backend.js --platform=node --external:electron --external:luaparse --external:jsonpath
npx yarn electron .\dist\backend.js
