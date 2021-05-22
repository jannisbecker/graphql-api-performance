module.exports = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "products",
  entities: [__dirname + "/model/*"],
  synchronize: true,
};
