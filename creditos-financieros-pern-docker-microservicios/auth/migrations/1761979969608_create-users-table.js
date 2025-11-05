exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    username: { type: "varchar(100)", notNull: true, unique: true },
    password: { type: "text", notNull: true },
    role: { type: "varchar(20)", notNull: true, default: "user" },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") }
  });
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};
