exports.up = (pgm) => {
  pgm.createTable('Firma', {
    id: 'id', // autoincremento
    solicitud_id: { type: 'integer', notNull: true },
    user_id: { type: 'integer', notNull: true },

    documentos_url: { type: 'text', notNull: false },   // ruta o link del PDF
    firma_validada: { type: 'boolean', notNull: true, default: false },

    metodo_autenticacion: { type: 'varchar(32)', notNull: true, default: 'simulada' },

    // Estados del flujo
    estado: { 
      type: 'varchar(32)', 
      notNull: true,
      default: 'PENDIENTE_FIRMA' //  FIRMADO -> VALIDADO -> LISTO_PARA_DESEMBOLSO
    },

    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') }
  });

  pgm.createIndex('Firma', 'solicitud_id');
  pgm.createIndex('Firma', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('Firma');
};
