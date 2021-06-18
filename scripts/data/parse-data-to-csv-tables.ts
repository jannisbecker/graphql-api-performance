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

const dataStream = fs
  .createReadStream(__dirname + "/in/data.json")
  .pipe(ndjson.parse());

const productWriter = stringify({
  header: true,
  columns: ["id", "name", "brand", "image_url", "price"],
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
  // Skip entries that have unclean data, like no title, no brand, no image url, or a not properly formatted price tag
  if (
    !entry.title ||
    !entry.imageURL[0] ||
    !entry.brand ||
    !entry.price.startsWith("$")
  )
    return;

  // Decode any strings that might contain html escaped characters
  const name: string = decode(entry.title);
  const brand: string = decode(entry.brand);

  // Parse price by stripping $ sign and parse to float
  const price: number = parseFloat(entry.price.substr(1));

  const productId = productCount++;

  // If the entry has categories, process them
  // by writing to the category and product_category tables
  if (entry.category) {
    // Create a set to filter out duplicate categories
    const categories = new Set(entry.category);
    categories.forEach((name) => {
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
    name,
    brand,
    entry.imageURLHighRes[0] || entry.imageURL[0],
    price,
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
