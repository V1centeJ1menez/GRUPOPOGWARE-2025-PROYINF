exports.up = (pgm) => {
  // Eliminar la columna resultado si existe
  pgm.dropColumn('simulaciones', 'resultado');
};

exports.down = (pgm) => {
  // Re-crear la columna en caso de rollback (valor por defecto 'simulada')
  pgm.addColumn('simulaciones', {
    resultado: { type: 'varchar(50)', notNull: true, default: 'simulada' }
  });
};
