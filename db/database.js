module.exports = {
  development: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.DB_NAME,
    host: process.env.PGHOST,
    dialect: "postgres",
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
  },
  test: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.DB_NAME,
    host: process.env.PGHOST,
    dialect: "postgres",
  },
  production: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.DB_NAME,
    host: process.env.PGHOST,
    dialect: "postgres",
  },
};
