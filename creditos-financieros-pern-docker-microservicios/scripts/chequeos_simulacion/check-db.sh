#!/bin/bash
# Script de pruebas para verificar la base de datos simulacion_db

echo "=========================================="
echo "  INSPECCIÓN DE BASE DE DATOS SIMULACIÓN"
echo "=========================================="
echo ""

echo "📊 1. Listando tablas existentes:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "\dt"
echo ""

echo "📋 2. Estructura de la tabla 'simulaciones':"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "\d simulaciones"
echo ""

echo "📈 3. Simulaciones actuales en la base de datos:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "SELECT id, user_id, monto, plazo, cuota_mensual, resultado, created_at FROM simulaciones ORDER BY created_at DESC LIMIT 10;"
echo ""

echo "🔢 4. Conteo total de simulaciones:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "SELECT COUNT(*) as total_simulaciones FROM simulaciones;"
echo ""

echo "📊 5. Simulaciones por usuario:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "SELECT user_id, COUNT(*) as cantidad, AVG(monto) as monto_promedio FROM simulaciones GROUP BY user_id ORDER BY cantidad DESC;"
echo ""

echo "✅ 6. Simulaciones aprobadas vs rechazadas:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "SELECT resultado, COUNT(*) as cantidad FROM simulaciones GROUP BY resultado;"
echo ""

echo "💰 7. Estadísticas generales:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "SELECT MIN(monto) as monto_min, MAX(monto) as monto_max, AVG(monto)::numeric(10,2) as monto_promedio, AVG(plazo)::numeric(5,2) as plazo_promedio FROM simulaciones;"
echo ""

echo "🔧 8. Migraciones aplicadas:"
docker compose exec -T db_simulacion psql -U postgres -d simulacion_db -c "SELECT name, run_on FROM pgmigrations ORDER BY run_on;"
echo ""

echo "=========================================="
echo "  ✅ Inspección completada"
echo "=========================================="
