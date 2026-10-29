#!/bin/bash
# ==============================================================================
# Script de Respaldo de Base de Datos PostgreSQL (HT-004 / RNF-003)
# Escuela Superior Politécnica de Chimborazo (ESPOCH)
# ==============================================================================

FECHA=$(date +"%Y%m%d_%H%M%S")
DIRECTORIO_RESPALDOS="./respaldos"
NOMBRE_ARCHIVO="respaldo_Microcredenciales_ESPOCH_${FECHA}.sql.gz"

mkdir -p "$DIRECTORIO_RESPALDOS"

echo "[$(date)] Iniciando respaldo de la base de datos Microcredenciales_ESPOCH..."

# Verificar si Docker está en ejecución
if docker ps --format '{{.Names}}' | grep -q "espoch_postgres"; then
    echo "Ejecutando respaldo a través del contenedor espoch_postgres..."
    docker exec -t espoch_postgres pg_dump -U postgres -d Microcredenciales_ESPOCH | gzip > "${DIRECTORIO_RESPALDOS}/${NOMBRE_ARCHIVO}"
else
    echo "Ejecutando respaldo local con pg_dump..."
    PGPASSWORD="${PGPASSWORD:-andrespacman2003}" pg_dump -h 127.0.0.1 -p 5432 -U postgres -d Microcredenciales_ESPOCH | gzip > "${DIRECTORIO_RESPALDOS}/${NOMBRE_ARCHIVO}"
fi

if [ $? -eq 0 ]; then
    echo "[$(date)] Respaldo completado con éxito: ${DIRECTORIO_RESPALDOS}/${NOMBRE_ARCHIVO}"
    # Eliminar respaldos más antiguos a 7 días (rotación)
    find "$DIRECTORIO_RESPALDOS" -name "*.sql.gz" -mtime +7 -exec rm {} \;
else
    echo "[$(date)] ERROR: El respaldo ha fallado."
    exit 1
fi

