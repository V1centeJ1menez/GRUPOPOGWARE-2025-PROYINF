exports.up = (pgm) => {
  pgm.addColumn('users', {
    email: { type: 'text', notNull: true, unique: true }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'email');
};
