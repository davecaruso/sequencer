# creative toolkit changelog

## 0.34.1
- Orginized build scripts into ./ctk.mjs

## 0.34.0
- Using React in Suspense Mode
- AppState has been rewritten to mainly be an object of Resources
- Removed .ctk and Project file types, you will be opening sequences as .sq files directly
- Action format updated. Action delcarations moved to ./backend/actions, while frontend dispatching
  is done through the new `Actions` object, with proper type safety put in place.
- Sequences now have a single timeline where audio and fusion clips live. these have been heavily
  generalized
- Fixed bugged fusion render node from appearing. it is not required when fusion 9 is installed.

## 0.33.1
- add action type System_OpenCache
- add action type System_OpenProjectFolder

## 0.33.0
- first of the "basic as hell rewrites" lineup
