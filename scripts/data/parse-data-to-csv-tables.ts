/**
 * Download the "Electronics" metadata dataset from http://deepyeti.ucsd.edu/jianmo/amazon/index.html
 * and place it in the same folder as this script, with the name "data.json"
 */

import fs from "fs";
import ndjson from "ndjson";
import stringify from "csv-stringify";
import { decode } from "he";

type DataRecord = {
  title: string;
  brand: string;
  price: string;
  imageURL: string[];
  imageURLHighRes: string[];
  category?: string[];
};

type Product = {
  id: number;
  title: string;
  brand: string;
  image_url: string;
  price: string;
};

type Category = {
  id: number;
  name: string;
};

type ProductCategory = {
  productId: number;
  categoryId: number;
};

const dataStream = fs
  .createReadStream(__dirname + "/in/data.json")
  .pipe(ndjson.parse());

const productWriter = stringify({
  header: true,
  columns: ["id", "title", "brand", "image_url", "price"],
});
productWriter.pipe(fs.createWriteStream(__dirname + "/out/data_products.csv"));

const categoryWriter = stringify({
  header: true,
  columns: ["id", "name"],
});
categoryWriter.pipe(
  fs.createWriteStream(__dirname + "/out/data_categories.csv")
);

const productCategoryWriter = stringify({
  header: true,
  columns: ["productId", "categoryId"],
});
productCategoryWriter.pipe(
  fs.createWriteStream(__dirname + "/out/data_product_categories.csv")
);

// Store all found categories. We'll use a map for this as we need immediate access to added category IDs in following product iterations
const categoryMap = new Map<string, number>();

// Count up processed products to get the auto incrementing ID and for progress reporting
let productCount = 0;

// Whenever data from the json file stream comes in
dataStream.on("data", async (entry: DataRecord) => {
  // Skip entries that have unclean data, like no title, no image url, or a not properly formatted price tag
  if (!entry.title || !entry.imageURL[0] || !entry.price.startsWith("$"))
    return;

  // Decode any strings that might contain html escaped characters
  entry.title = decode(entry.title);
  entry.brand = decode(entry.brand);

  const productId = productCount++;

  // If the entry has categories, process them
  // by writing to the category and product_category tables
  if (entry.category) {
    entry.category.forEach((name) => {
      // Decode html escaped category names as well
      name = decode(name);

      let categoryId = categoryMap.get(name);

      if (categoryId === undefined) {
        categoryId = categoryMap.size;
        categoryMap.set(name, categoryId);

        categoryWriter.write([categoryId, name]);
      }

      productCategoryWriter.write([productId, categoryId]);
    });
  }

  // Then write the product to the product table
  productWriter.write([
    productId,
    entry.title,
    entry.brand,
    entry.imageURLHighRes[0] || entry.imageURL[0],
    entry.price,
  ]);

  console.log("Processed " + productCount + " entries");
});

// Close all streams when reading is done
dataStream.on("end", () => {
  productWriter.end();
  categoryWriter.end();
  productCategoryWriter.end();

  console.log("Finished!");
});
