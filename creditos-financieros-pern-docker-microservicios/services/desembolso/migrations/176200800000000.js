exports.up = (pgm) => {
  pgm.createTable('Desembolso', {
    id: 'id',
    solicitud_id: { type: 'integer', notNull: true },
    user_id: { type: 'integer', notNull: true },

    monto: { type: 'numeric', notNull: true },                // monto aprobado
    cuenta_destino: { type: 'varchar(64)', notNull: true },   // solo personal (RUT/CBU/etc)


    estado: { 
      type: 'varchar(32)', 
      notNull: true, 
      default: 'pendiente'  //  enviado -> completo → fallido?
    },

    fecha_desembolso: { type: 'timestamp', default: pgm.func('now()') },

    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') }
  });

  pgm.createIndex('Desembolso', 'solicitud_id');
  pgm.createIndex('Desembolso', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('Desembolso');
};
