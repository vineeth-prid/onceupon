@echo off
cd d:\react_storybook\once-upon-a-time\packages\shared\src
del /s /q *.js
del /s /q *.js.map
del /s /q *.d.ts
del /s /q *.d.ts.map
echo Cleaned up accidentally built JS files in src!
