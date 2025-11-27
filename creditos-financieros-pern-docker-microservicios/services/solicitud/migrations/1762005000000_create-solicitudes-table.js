exports.up = (pgm) => {
  pgm.createTable('solicitudes', {
    id: 'id',
    user_id: { type: 'integer', notNull: true },
    monto: { type: 'numeric', notNull: true },
    plazo: { type: 'integer', notNull: true },
    tasa_base: { type: 'numeric', notNull: false },
    cae: { type: 'numeric', notNull: false },
    cuota_mensual: { type: 'numeric', notNull: false },
    monto_total: { type: 'numeric', notNull: false },
    monto_liquido: { type: 'numeric', notNull: false },
    intereses_totales: { type: 'numeric', notNull: false },
    gastos_operacionales: { type: 'numeric', notNull: false },
    comision_apertura: { type: 'numeric', notNull: false },
    estado: { type: 'varchar(32)', notNull: true, default: 'borrador' },
    origen: { type: 'varchar(32)', notNull: true, default: 'simulacion' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('solicitudes', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('solicitudes');
};
