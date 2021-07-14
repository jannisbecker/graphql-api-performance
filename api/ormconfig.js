const entityFolder = __dirname + `/${process.env.TS_NODE_DEV ? "src" : "dist"}/model/*`

module.exports = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  entities: [entityFolder],
  synchronize: true,
};
