@echo off
setlocal
cd /d "%~dp0"
echo Folder: %CD%
if not exist "PrintAgent.java" (
  echo PrintAgent.java was not found in this folder.
  echo Put start-print-agent.bat and PrintAgent.java in the same folder, then run the bat again.
  pause
  exit /b 1
)
where javac >nul 2>&1
if errorlevel 1 (
  echo javac was not found. Install the Java JDK, then close and reopen this window.
  pause
  exit /b 1
)
javac PrintAgent.java
if errorlevel 1 (
  echo Could not compile PrintAgent.java. See the message above.
  pause
  exit /b 1
)
echo Print agent is listening. Leave this window open.
java -cp "%CD%" PrintAgent
pause
