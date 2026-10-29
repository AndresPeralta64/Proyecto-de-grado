@echo off
REM ==============================================================================
REM Script de Respaldo de Base de Datos PostgreSQL para Windows (HT-004 / RNF-003)
REM ==============================================================================

set FECHA=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set FECHA=%FECHA: =0%
set DIRECTORIO_RESPALDOS=.\respaldos
set NOMBRE_ARCHIVO=respaldo_Microcredenciales_ESPOCH_%FECHA%.sql

if not exist "%DIRECTORIO_RESPALDOS%" mkdir "%DIRECTORIO_RESPALDOS%"

echo [%date% %time%] Iniciando respaldo de Microcredenciales_ESPOCH...

docker ps --format "{{.Names}}" | findstr /i "espoch_postgres" >nul 2>&1
if %errorlevel% equ 0 (
    echo Ejecutando respaldo a traves del contenedor espoch_postgres...
    docker exec -t espoch_postgres pg_dump -U postgres -d Microcredenciales_ESPOCH > "%DIRECTORIO_RESPALDOS%\%NOMBRE_ARCHIVO%"
) else (
    echo Ejecutando respaldo local con pg_dump...
    set PGPASSWORD=andrespacman2003
    pg_dump -h 127.0.0.1 -p 5432 -U postgres -d Microcredenciales_ESPOCH > "%DIRECTORIO_RESPALDOS%\%NOMBRE_ARCHIVO%"
)

if %errorlevel% equ 0 (
    echo [%date% %time%] Respaldo completado con exito: %DIRECTORIO_RESPALDOS%\%NOMBRE_ARCHIVO%
) else (
    echo [%date% %time%] ERROR: El respaldo ha fallado.
)

