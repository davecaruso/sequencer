Write-Host "Building Creative Toolkit"
yarn tsc
yarn vite build frontend --outDir build/app
yarn esbuild --bundle .\backend\index.ts --outfile=build\app\index.js --platform=node --external:@types/node --external:electron --external:eventemitter3 --external:express --external:fs-extra --external:immer --external:jsonpath-faster --external:luaparse --external:react --external:react-dom --external:sass --external:uuid --external:yargs
Copy-Item .\package.json .\build\app\package.json
