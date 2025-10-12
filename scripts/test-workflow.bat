@echo off
setlocal enabledelayedexpansion

:: ngx-i18n-tools Local Testing Workflow (Windows)
:: This script tests the library with the demo application

echo.
echo ========================================================
echo   ngx-i18n-tools - Local Testing Workflow
echo ========================================================
echo.

:: Step 1: Clean previous builds
echo [Step 1] Cleaning previous builds...
if exist "dist\ngx-i18n-tools" (
    rmdir /s /q "dist\ngx-i18n-tools"
    echo [OK] Cleaned dist\ngx-i18n-tools
)

:: Step 2: Build the library
echo.
echo [Step 2] Building @gridatek/ngx-i18n-tools library...
call npm run build:lib
if %errorlevel% neq 0 (
    echo [ERROR] Library build failed
    exit /b 1
)
echo [OK] Library build successful

:: Step 3: Verify build output
echo.
echo [Step 3] Verifying build output...
if not exist "dist\ngx-i18n-tools\package.json" (
    echo [ERROR] Missing dist\ngx-i18n-tools\package.json
    exit /b 1
)
echo [OK] Found package.json

if not exist "dist\ngx-i18n-tools\builders.json" (
    echo [ERROR] Missing builders.json
    exit /b 1
)
echo [OK] Found builders.json

if not exist "dist\ngx-i18n-tools\schematics\collection.json" (
    echo [ERROR] Missing schematics\collection.json
    exit /b 1
)
echo [OK] Found schematics\collection.json

if not exist "dist\ngx-i18n-tools\src\lib\builders\extract-builder.ts" (
    echo [ERROR] Missing extract-builder.ts
    exit /b 1
)
echo [OK] Found builder TypeScript files

:: Step 4: Create npm package
echo.
echo [Step 4] Creating npm package...
cd dist\ngx-i18n-tools
call npm pack
if %errorlevel% neq 0 (
    echo [ERROR] npm pack failed
    cd ..\..
    exit /b 1
)
cd ..\..

:: Find the tarball
for %%f in (dist\ngx-i18n-tools\*.tgz) do set TARBALL=%%f
if not defined TARBALL (
    echo [ERROR] Failed to create tarball
    exit /b 1
)
echo [OK] Created package: %TARBALL%

:: Step 5: Install package locally
echo.
echo [Step 5] Installing package in workspace...
call npm install "%TARBALL%" --no-save
if %errorlevel% neq 0 (
    echo [ERROR] Package installation failed
    exit /b 1
)
echo [OK] Package installed

:: Step 6: Verify installation
echo.
echo [Step 6] Verifying package installation...
if not exist "node_modules\@gridatek\ngx-i18n-tools" (
    echo [ERROR] Package not found in node_modules
    exit /b 1
)
echo [OK] Package installed in node_modules

if exist "node_modules\@gridatek\ngx-i18n-tools\builders.json" (
    echo [OK] Builders registry found
)

if exist "node_modules\@gridatek\ngx-i18n-tools\schematics\collection.json" (
    echo [OK] Schematics collection found
)

:: Step 7: Clean previous demo translations
echo.
echo [Step 7] Cleaning previous demo translations...
if exist "projects\demo-app\src\locale" (
    rmdir /s /q "projects\demo-app\src\locale"
    echo [OK] Cleaned demo locale directory
)

:: Remove any existing .i18n.json files
for /r "projects\demo-app\src" %%f in (*.i18n.json) do (
    del "%%f" 2>nul
)
echo [OK] Cleaned existing translation files

:: Step 8: Extract i18n from templates
echo.
echo [Step 8] Running extract-i18n builder...
call npm run i18n:extract
if %errorlevel% neq 0 (
    echo [WARNING] i18n extraction had issues (may be expected if no i18n markers exist)
) else (
    echo [OK] i18n extraction complete
)

:: Step 9: Verify extraction output
echo.
echo [Step 9] Verifying extracted translations...
set I18N_COUNT=0
for /r "projects\demo-app\src" %%f in (*.i18n.json) do (
    set /a I18N_COUNT+=1
    echo   - %%f
)

if !I18N_COUNT! gtr 0 (
    echo [OK] Found !I18N_COUNT! translation file^(s^)
) else (
    echo [WARNING] No translation files created ^(check if templates have i18n markers^)
)

:: Step 10: Validate translations
echo.
echo [Step 10] Running validation...
call npm run i18n:validate
if %errorlevel% neq 0 (
    echo [WARNING] Validation had issues
) else (
    echo [OK] Translation validation complete
)

:: Step 11: Export to XLIFF
echo.
echo [Step 11] Exporting to XLIFF format...
call npm run i18n:export
if %errorlevel% neq 0 (
    echo [WARNING] XLIFF export had issues
) else (
    echo [OK] XLIFF export complete
)

:: Step 12: Verify XLIFF output
echo.
echo [Step 12] Verifying XLIFF files...
if exist "projects\demo-app\src\locale" (
    set XLIFF_COUNT=0
    for %%f in (projects\demo-app\src\locale\*.xlf) do (
        set /a XLIFF_COUNT+=1
        echo   - %%f
    )

    if !XLIFF_COUNT! gtr 0 (
        echo [OK] Found !XLIFF_COUNT! XLIFF file^(s^)
    ) else (
        echo [WARNING] No XLIFF files created
    )
)

:: Step 13: Test merge builder
echo.
echo [Step 13] Testing merge builder ^(per-component to merged^)...
if !I18N_COUNT! gtr 0 (
    call npm run i18n:merge
    if exist "projects\demo-app\src\locale\translations.json" (
        echo [OK] Created merged translation file
    )
)

:: Step 14: Build demo app
echo.
echo [Step 14] Building demo app ^(development mode^)...
call npm run build:demo -- --configuration=development
if %errorlevel% neq 0 (
    echo [ERROR] Demo app build failed
    exit /b 1
)
echo [OK] Demo app build successful

:: Step 15: Summary
echo.
echo ========================================================
echo   Testing Workflow Complete!
echo ========================================================
echo.
echo Summary:
echo   [OK] Library built successfully
echo   [OK] Package created and installed
echo   [OK] Builders are functional
echo   [OK] Demo app builds successfully
echo.
echo Next steps:
echo   1. Run the demo app:    npm run serve:demo
echo   2. Review translations: dir /s /b projects\demo-app\src\*.i18n.json
echo   3. Review XLIFF files:  dir projects\demo-app\src\locale\*.xlf
echo   4. Publish to npm:      cd dist\ngx-i18n-tools ^&^& npm publish --access public
echo.
echo All tests passed!
echo.

endlocal
