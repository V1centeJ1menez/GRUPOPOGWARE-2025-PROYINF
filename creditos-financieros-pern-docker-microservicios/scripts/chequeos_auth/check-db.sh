#!/bin/bash
# Script de pruebas para verificar la base de datos auth_db

echo "=========================================="
echo "  INSPECCIÓN DE BASE DE DATOS AUTH"
echo "=========================================="
echo ""

echo " 1. Listando tablas existentes:"
docker compose exec -T db_auth psql -U postgres -d auth_db -c "\dt"
echo ""

echo " 2. Estructura de la tabla 'users':"
docker compose exec -T db_auth psql -U postgres -d auth_db -c "\d users"
echo ""

echo " 3. Usuarios actuales en la base de datos:"
docker compose exec -T db_auth psql -U postgres -d auth_db -c "SELECT id, username, email, role, created_at FROM users ORDER BY id;"
echo ""

echo " 4. Conteo total de usuarios:"
docker compose exec -T db_auth psql -U postgres -d auth_db -c "SELECT COUNT(*) as total_users FROM users;"
echo ""

echo " 5. Migraciones aplicadas:"
docker compose exec -T db_auth psql -U postgres -d auth_db -c "SELECT name, run_on FROM pgmigrations ORDER BY run_on;"
echo ""

echo "=========================================="
echo "  Inspección completada"
echo "=========================================="
