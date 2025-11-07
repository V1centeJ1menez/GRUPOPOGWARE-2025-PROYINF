#!/bin/bash
# Script para probar endpoints de Simulación

API_URL="http://localhost:8080/simulacion"
AUTH_URL="http://localhost:8080/auth"

echo "=========================================="
echo "🧪 PRUEBAS DE API SIMULACIÓN"
echo "=========================================="
echo ""

# Función para imprimir con color
print_success() { echo -e "\033[0;32m✅ $1\033[0m"; }
print_error() { echo -e "\033[0;31m❌ $1\033[0m"; }
print_info() { echo -e "\033[0;36mℹ️  $1\033[0m"; }
print_warning() { echo -e "\033[0;33m⚠️  $1\033[0m"; }

# 0. Health check
echo "0️⃣  Verificando health del servicio Simulación..."
HEALTH=$(curl -s "$API_URL/health")
if [[ $HEALTH == *"OK"* ]] || [[ $HEALTH == *"simulacion"* ]]; then
  print_success "Simulación está respondiendo"
  echo "Respuesta: $HEALTH"
else
  print_error "Simulación no responde correctamente"
  echo "Respuesta: $HEALTH"
fi
echo ""

# 1. Crear usuario de prueba y obtener token
echo "1️⃣  Creando usuario de prueba para simulaciones..."
RANDOM_NUM=$RANDOM
USERNAME="simuser_$RANDOM_NUM"
EMAIL="simuser$RANDOM_NUM@test.com"
PASSWORD="password123"

REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [[ $REGISTER_RESPONSE == *"Usuario creado"* ]]; then
  print_success "Usuario de prueba creado: $USERNAME"
else
  print_warning "No se pudo crear usuario (puede que ya exista uno de pruebas anteriores)"
fi
echo ""

echo "2️⃣  Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
  print_success "Token obtenido exitosamente"
  print_info "Token: ${TOKEN:0:50}..."
else
  print_error "Error al obtener token"
  echo "Respuesta: $LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 3. Crear simulación válida (aprobada)
echo "3️⃣  Creando simulación APROBADA (monto: 5000000, plazo: 24 meses)..."
SIM1_RESPONSE=$(curl -s -X POST "$API_URL/api/simular" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"monto":5000000,"plazo":24}')

if [[ $SIM1_RESPONSE == *"cuotaMensual"* ]]; then
  print_success "Simulación aprobada creada exitosamente"
  SIM1_ID=$(echo $SIM1_RESPONSE | jq -r '.id')
  CUOTA=$(echo $SIM1_RESPONSE | jq -r '.cuotaMensual')
  CAE=$(echo $SIM1_RESPONSE | jq -r '.cae')
  RESULTADO=$(echo $SIM1_RESPONSE | jq -r '.resultado')
  print_info "ID: $SIM1_ID | Cuota: \$$CUOTA | CAE: $CAE | Resultado: $RESULTADO"
else
  print_error "Error al crear simulación"
  echo "Respuesta: $SIM1_RESPONSE"
fi
echo ""

# 4. Crear simulación rechazada (monto muy bajo)
echo "4️⃣  Creando simulación RECHAZADA (monto: 500, plazo: 12 meses)..."
SIM2_RESPONSE=$(curl -s -X POST "$API_URL/api/simular" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"monto":500,"plazo":12}')

if [[ $SIM2_RESPONSE == *"rechazado"* ]]; then
  print_success "Simulación rechazada correctamente (validación funciona)"
  RESULTADO=$(echo $SIM2_RESPONSE | jq -r '.resultado')
  print_info "Resultado: $RESULTADO"
else
  print_warning "La simulación no fue rechazada como se esperaba"
  echo "Respuesta: $SIM2_RESPONSE"
fi
echo ""

# 5. Crear otra simulación aprobada con diferentes parámetros
echo "5️⃣  Creando otra simulación APROBADA (monto: 10000000, plazo: 36 meses)..."
SIM3_RESPONSE=$(curl -s -X POST "$API_URL/api/simular" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"monto":10000000,"plazo":36}')

if [[ $SIM3_RESPONSE == *"cuotaMensual"* ]]; then
  print_success "Segunda simulación aprobada creada"
  SIM3_ID=$(echo $SIM3_RESPONSE | jq -r '.id')
  CUOTA=$(echo $SIM3_RESPONSE | jq -r '.cuotaMensual')
  MONTO_LIQUIDO=$(echo $SIM3_RESPONSE | jq -r '.montoLiquido')
  print_info "ID: $SIM3_ID | Cuota: \$$CUOTA | Monto líquido: \$$MONTO_LIQUIDO"
else
  print_error "Error al crear segunda simulación"
fi
echo ""

# 6. Obtener historial de simulaciones
echo "6️⃣  Obteniendo historial de simulaciones del usuario..."
HISTORIAL=$(curl -s -X GET "$API_URL/api/historial" \
  -H "Authorization: Bearer $TOKEN")

if [[ $HISTORIAL == *"["* ]]; then
  COUNT=$(echo $HISTORIAL | jq '. | length')
  print_success "Historial obtenido: $COUNT simulación(es)"
  echo "$HISTORIAL" | jq -r '.[] | "  - ID: \(.id) | Monto: \(.monto) | Plazo: \(.plazo) meses | Resultado: \(.resultado)"'
else
  print_error "Error al obtener historial"
  echo "Respuesta: $HISTORIAL"
fi
echo ""

# 7. Obtener historial limitado
echo "7️⃣  Obteniendo historial limitado (últimas 2 simulaciones)..."
HISTORIAL_LIMIT=$(curl -s -X GET "$API_URL/api/historial?limit=2" \
  -H "Authorization: Bearer $TOKEN")

if [[ $HISTORIAL_LIMIT == *"["* ]]; then
  COUNT=$(echo $HISTORIAL_LIMIT | jq '. | length')
  print_success "Historial limitado obtenido: $COUNT simulación(es)"
else
  print_error "Error al obtener historial limitado"
fi
echo ""

# 8. Obtener simulación por ID
if [ ! -z "$SIM1_ID" ]; then
  echo "8️⃣  Obteniendo simulación específica por ID ($SIM1_ID)..."
  SIM_BY_ID=$(curl -s -X GET "$API_URL/api/$SIM1_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  if [[ $SIM_BY_ID == *"id"* ]]; then
    print_success "Simulación obtenida por ID correctamente"
    echo "$SIM_BY_ID" | jq '.'
  else
    print_error "Error al obtener simulación por ID"
  fi
  echo ""
fi

# 9. Validación de campos requeridos
echo "9️⃣  Probando validación de campos requeridos..."
VALIDATION=$(curl -s -X POST "$API_URL/api/simular" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"monto":5000000}')

if [[ $VALIDATION == *"error"* ]] || [[ $VALIDATION == *"requeridos"* ]]; then
  print_success "Validación de campos funciona correctamente"
else
  print_warning "La validación de campos no respondió como se esperaba"
fi
echo ""

# 10. Eliminar una simulación
if [ ! -z "$SIM3_ID" ]; then
  echo "🔟 Eliminando simulación ($SIM3_ID)..."
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/$SIM3_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  if [[ $DELETE_RESPONSE == *"eliminada"* ]]; then
    print_success "Simulación eliminada correctamente"
  else
    print_error "Error al eliminar simulación"
    echo "Respuesta: $DELETE_RESPONSE"
  fi
  echo ""
fi

# 11. Intentar acceder sin token
echo "1️⃣1️⃣  Probando acceso sin token de autenticación..."
NO_AUTH=$(curl -s -X POST "$API_URL/api/simular" \
  -H "Content-Type: application/json" \
  -d '{"monto":5000000,"plazo":24}')

if [[ $NO_AUTH == *"no autenticado"* ]] || [[ $NO_AUTH == *"401"* ]]; then
  print_success "Protección de autenticación funciona correctamente"
else
  print_warning "La protección de autenticación no funcionó como se esperaba"
  echo "Respuesta: $NO_AUTH"
fi
echo ""

echo "=========================================="
echo "✅ Pruebas completadas"
echo "=========================================="
echo ""
print_info "Para ver las simulaciones en la BD, ejecuta:"
print_info "  ./scripts/chequeos_simulacion/check-db.sh"
