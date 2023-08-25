@call "%~dp0build.bat" -p
@IF %ERRORLEVEL% NEQ 0 goto errorto
@echo.
@echo ====== publish success ======
@goto endto
:errorto
@set bakup = %ERRORLEVEL%
@echo.
@echo !!!!!! publish failed !!!!!!
@pause
@set ERRORLEVEL = %bakup%
:endto