@echo off
setlocal

set SRC_DIR=src\main\java\com\guessinggame
set CLASSES_DIR=target\classes\com\guessinggame
set JAR_FILE=number-guessing-game.jar

:: Create directories
if not exist "%CLASSES_DIR%" mkdir "%CLASSES_DIR%"

:: Compile Java files
echo Compiling Java files...
"%JAVA_HOME%\bin\javac" -d target\classes %SRC_DIR%\*.java

:: Create JAR file
echo Creating JAR file...
cd target\classes
"%JAVA_HOME%\bin\jar" cfm ..\..\%JAR_FILE% ..\..\MANIFEST.MF com\
cd ..\..

echo.
echo Build complete! Run the game with: java -jar %JAR_FILE%
pause
endlocal
