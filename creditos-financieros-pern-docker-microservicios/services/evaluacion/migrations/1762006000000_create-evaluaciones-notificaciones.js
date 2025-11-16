exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('evaluaciones', {
    id: 'id',
    user_id: { type: 'integer', notNull: true },
    solicitud_id: { type: 'integer' },
    monto: { type: 'numeric', notNull: true },
    plazo: { type: 'integer', notNull: true },
    tasa_base: { type: 'numeric' },
    cae: { type: 'numeric' },
    cuota_mensual: { type: 'numeric' },
    decision: { type: 'varchar(16)', notNull: true },
    score: { type: 'numeric' },
    razones: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') }
  });
  pgm.createIndex('evaluaciones', 'user_id');

  pgm.createTable('notificaciones', {
    id: 'id',
    user_id: { type: 'integer', notNull: true },
    tipo: { type: 'varchar(32)', notNull: true },
    titulo: { type: 'text' },
    mensaje: { type: 'text' },
    leida: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') }
  });
  pgm.createIndex('notificaciones', ['user_id', 'leida']);
};

exports.down = (pgm) => {
  pgm.dropTable('notificaciones');
  pgm.dropTable('evaluaciones');
};
