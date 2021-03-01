import fs from "fs";
import ndjson from "ndjson";
import { Sequelize } from "sequelize-typescript";
import { Product } from "../model/Product";
import { options } from "../sequelize.config";

async function importData(): Promise<void> {
  // Create new Sequelize instance with database settings
  const sequelize = new Sequelize({
    ...options,
    dialectOptions: {
      connectTimeout: 1000000,
    },
  });

  // Test if Sequelize connection works
  await sequelize.authenticate().catch((error) => {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  });

  // Create data stream from data.json file using ndjson stream parser
  const pipeline = fs.createReadStream("data.json").pipe(ndjson.parse());

  // Count number of imported products
  let importCount = 0;

  // Create and import new Product whenever a new json object is streamed in
  pipeline.on("data", async (data) => {
    if (!data.title || !data.image[0] || !data.price.startsWith("$")) return;

    Product.create({
      title: data.title,
      brand: data.brand,
      price: data.price,
      image_url: data.image[0],
    }).catch((error) => {
      console.error(error);
      process.exit(1);
    });

    console.log("Imported " + ++importCount + " products.");
  });
}

(async () => await importData())();
