# creative toolkit changelog

## 0.34.0
- Using React in Suspense Mode
- AppState has been rewritten to mainly be an object of Resources
- Removed .ctk and Project file types, you will be opening sequences as .sq files directly
- Action format updated. Action delcarations moved to ./backend/actions, while frontend dispatching
  is done through the new `Actions` object, with proper type safety put in place.
- Sequences now have a single timeline where audio and fusion clips live. these have been heavily
  generalized
- FIXME: Removed the file picker at startup, will need to add back.
- FIXME: Rendering does not yet work anymore. Logic is in ./backend/old

## 0.33.3
- add action type System_OpenCache
- add action type System_OpenProjectFolder

## 0.33.0
- first of the "rewrite #33" lineup
