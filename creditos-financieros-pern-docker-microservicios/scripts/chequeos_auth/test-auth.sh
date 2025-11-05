#!/bin/bash
# Script para probar endpoints de Auth

API_URL="http://localhost:8080/auth"

echo "=========================================="
echo "🧪 PRUEBAS DE API AUTH"
echo "=========================================="
echo ""

# Función para imprimir con color
print_success() { echo -e "\033[0;32m✅ $1\033[0m"; }
print_error() { echo -e "\033[0;31m❌ $1\033[0m"; }
print_info() { echo -e "\033[0;36mℹ️  $1\033[0m"; }

# 1. Health check
echo "1️⃣  Verificando health del servicio Auth..."
HEALTH=$(curl -s "$API_URL/health")
if [[ $HEALTH == *"ok"* ]]; then
  print_success "Auth está respondiendo"
else
  print_error "Auth no responde correctamente"
fi
echo ""

# 2. Registrar un nuevo usuario
echo "2️⃣  Creando nuevo usuario de prueba..."
RANDOM_NUM=$RANDOM
USERNAME="user_$RANDOM_NUM"
EMAIL="user$RANDOM_NUM@test.com"
PASSWORD="password123"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [[ $REGISTER_RESPONSE == *"Usuario creado"* ]]; then
  print_success "Usuario creado: $USERNAME ($EMAIL)"
  echo "Respuesta: $REGISTER_RESPONSE"
else
  print_error "Error al crear usuario"
  echo "Respuesta: $REGISTER_RESPONSE"
fi
echo ""

# 3. Login con el usuario recién creado
echo "3️⃣  Iniciando sesión con el usuario creado..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  print_success "Login exitoso"
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
  print_info "Token JWT: ${TOKEN:0:50}..."
else
  print_error "Error en login"
  echo "Respuesta: $LOGIN_RESPONSE"
fi
echo ""

# 4. Intentar registrar usuario duplicado
echo "4️⃣  Probando validación de usuario duplicado..."
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"otro@email.com\",\"password\":\"$PASSWORD\"}")

if [[ $DUPLICATE_RESPONSE == *"ya existe"* ]]; then
  print_success "Validación de duplicados funciona correctamente"
else
  print_error "La validación de duplicados no funcionó como se esperaba"
fi
echo ""

# 5. Intentar login con contraseña incorrecta
echo "5️⃣  Probando login con contraseña incorrecta..."
BAD_LOGIN=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"wrongpassword\"}")

if [[ $BAD_LOGIN == *"inválida"* ]] || [[ $BAD_LOGIN == *"incorrecta"* ]]; then
  print_success "Validación de contraseña funciona correctamente"
else
  print_error "La validación de contraseña no funcionó"
fi
echo ""

echo "=========================================="
echo "✅ Pruebas completadas"
echo "=========================================="
echo ""
print_info "Para ver los usuarios en la BD, ejecuta: ./scripts/check-db.sh"
