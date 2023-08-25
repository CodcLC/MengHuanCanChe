@set arg1=%1%
@cd "%~dp0code"
@call npm install
@IF %ERRORLEVEL% NEQ 0 goto errorto
@set tscp=%~dp0code\node_modules\.bin\tsc-plus
@call "%tscp%" --version
@IF %ERRORLEVEL% NEQ 0 goto errorto
@IF "%arg1%"=="-p" goto publish
call "%tscp%" --reorderFiles -p "%~dp0code\tsconfig.json"
@IF %ERRORLEVEL% NEQ 0 goto errorto
@goto buildend
:publish
call "%tscp%" --reorderFiles -p "%~dp0code\tsconfig.json" --sourceMap false --inlineSourceMap false --inlineSources false
@IF %ERRORLEVEL% NEQ 0 goto errorto
:buildend
@IF NOT EXIST "%~dp0code\config\serverConfig.js" (IF EXIST "%~dp0code\config\serverConfig.bak.js" echo F | xcopy /Y "%~dp0code\config\serverConfig.bak.js" "%~dp0code\config\serverConfig.js")
@echo.
@echo ====== build success ======
call "%~dp0after_build.bat"
@IF %ERRORLEVEL% NEQ 0 goto errorto
@goto endto
:errorto
@set bakup = %ERRORLEVEL%
@echo.
@echo !!!!!! build failed !!!!!!
@set ERRORLEVEL = %bakup%
:endto