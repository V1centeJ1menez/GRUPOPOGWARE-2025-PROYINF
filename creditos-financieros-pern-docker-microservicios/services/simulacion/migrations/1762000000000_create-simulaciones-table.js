// Migration para crear la tabla de simulaciones
// Incluye todos los campos necesarios y relación con usuarios

exports.up = (pgm) => {
  pgm.createTable('simulaciones', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
    },
    monto: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    plazo: {
      type: 'integer',
      notNull: true,
    },
    tasa_base: {
      type: 'decimal(10,6)',
      notNull: true,
    },
    cae: {
      type: 'decimal(10,6)',
      notNull: true,
    },
    cuota_mensual: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    monto_total: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    monto_liquido: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    intereses_totales: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    gastos_operacionales: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    comision_apertura: {
      type: 'decimal(15,2)',
      notNull: true,
    },
    resultado: {
      type: 'varchar(50)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Índice para búsquedas por usuario
  pgm.createIndex('simulaciones', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('simulaciones');
};

