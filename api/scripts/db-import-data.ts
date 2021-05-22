import fs from "fs";
import ndjson from "ndjson";
import { createConnection } from "typeorm";
import { Category } from "../model/Category";
import { Product } from "../model/Product";

type Record = {
  title: string;
  brand: string;
  image: string[];
  price: string;
  category?: string[];
};

// Cache for created categories, so that we don't have to query each category for each product->category association
const categoryMap = new Map<string, Category>();

(async () => {
  const connection = await createConnection();
  const productRepository = connection.getRepository(Product);
  const categoryRepository = connection.getRepository(Category);

  // Create data stream from data.json file using ndjson stream parser
  const pipeline = fs.createReadStream("data.json").pipe(ndjson.parse());

  // Count number of imported products
  let importCount = 0;

  pipeline.on("data", async (entry: Record) => {
    if (!entry.title || !entry.image[0] || !entry.price.startsWith("$")) return;

    const categories = entry.category
      ? await Promise.all(
          entry.category.map(async (name) => {
            const cached = categoryMap.get(name);

            if (cached) {
              return cached;
            } else {
              const category = await categoryRepository.save({
                name,
              });

              categoryMap.set(name, category);

              return category;
            }
          })
        )
      : [];

    const product = await productRepository.save({
      name: entry.title,
      brand: entry.brand,
      price: entry.price,
      image_url: entry.image[0],
      categories,
    });

    console.log(`Imported ${++importCount} entries`);
  });
})();
