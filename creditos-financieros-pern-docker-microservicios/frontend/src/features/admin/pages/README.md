Para hacer el testeo


# Listar usuarios y roles
PGPASSWORD=postgres psql -h localhost -p 5400 -U postgres -d auth_db \
  -c "SELECT id, username, email, role FROM users ORDER BY id;"

# Promover por username
PGPASSWORD=postgres psql -h localhost -p 5400 -U postgres -d auth_db \
  -c "UPDATE users SET role='admin' WHERE username='TU_USUARIO';"

# O promover por id
PGPASSWORD=postgres psql -h localhost -p 5400 -U postgres -d auth_db \
  -c "UPDATE users SET role='admin' WHERE id=TU_ID;"

# Verificar el cambio
PGPASSWORD=postgres psql -h localhost -p 5400 -U postgres -d auth_db \
  -c "SELECT id, username, email, role FROM users WHERE username='TU_USUARIO';"