@xcopy /Y "%~dp0..\..\www\client\src\assets\Script\Plugins\core.d.ts" "%~dp0..\assets\framework\"
@IF %ERRORLEVEL% NEQ 0 goto errorto
@xcopy /Y "%~dp0..\..\www\client\src\assets\Script\Plugins\core.js" "%~dp0..\assets\framework\"
@IF %ERRORLEVEL% NEQ 0 goto errorto
@echo if(typeof window != 'undefined'){window.Share = Share;window.ClientCore = ClientCore;} >> "%~dp0..\cocos\assets\Script\Plugins\core.js"
@goto endto
:errorto
@set bakup = %ERRORLEVEL%
@set ERRORLEVEL = %bakup%
:endto