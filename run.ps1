yarn esbuild --bundle .\backend\index.ts --outfile=dist/backend.js --platform=node --external:electron --external:luaparse --external:yargs
yarn electron .\dist\backend.js --cache "$PWD/.cache"
