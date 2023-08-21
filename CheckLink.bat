@setlocal enableextensions enabledelayedexpansion
@echo off
@REM set ipaddr=%1
@REM set ipaddr=%SUTAddr%
set /a sum=1
set ipaddr=10.244.16.136
:loop
set state=down
for /f "tokens=5,6,7" %%a in ('ping -n 1 !ipaddr!') do (
    if "x%%b"=="xunreachable." goto :endloop
    if "x%%a"=="xReceived" if "x%%c"=="x1,"  set state=up
)
:endloop
echo %date% %time% %sum% BMC Link is !state!
@REM echo %date% %time% %sum% BMC Link is !state! >> 10.244.16.230_Link_Status.txt
ping -n 6 127.0.0.1 >nul: 2>nul:
set /a sum=%sum%+1
goto :loop
endlocal