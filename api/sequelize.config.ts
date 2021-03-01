import { SequelizeOptions } from "sequelize-typescript";

export const options: SequelizeOptions = {
  database: "products-db",
  dialect: "postgres",
  username: "postgres",
  password: "postgres",
  models: [__dirname + "/model"],
  logging: false,
};
