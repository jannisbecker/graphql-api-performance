import fs from "fs";
import ndjson from "ndjson";
import stringify from "csv-stringify";

type DataRecord = {
  title: string;
  brand: string;
  image: string[];
  price: string;
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
  .createReadStream(__dirname + "/data.json")
  .pipe(ndjson.parse());

const productWriter = stringify({
  header: true,
  columns: ["id", "title", "brand", "image_url", "price"],
});
productWriter.pipe(fs.createWriteStream(__dirname + "/products.csv"));

const categoryWriter = stringify({
  header: true,
  columns: ["id", "name"],
});
categoryWriter.pipe(fs.createWriteStream(__dirname + "/categories.csv"));

const productCategoryWriter = stringify({
  header: true,
  columns: ["productId", "categoryId"],
});
productCategoryWriter.pipe(
  fs.createWriteStream(__dirname + "/product_categories.csv")
);

// Store all found categories. We'll use a map for this as we need immediate access to added category IDs in following product iterations
const categoryMap = new Map<string, number>();

// Count up processed products to get the auto incrementing ID and for progress reporting
let productCount = 0;

dataStream.on("data", async (entry: DataRecord) => {
  if (!entry.title || !entry.image[0] || !entry.price.startsWith("$")) return;

  const productId = productCount++;

  if (entry.category) {
    entry.category.forEach((name) => {
      let categoryId = categoryMap.get(name);

      if (!categoryId) {
        categoryId = categoryMap.size;
        categoryMap.set(name, categoryId);

        categoryWriter.write([categoryId, name]);
      }

      productCategoryWriter.write([productId, categoryId]);
    });
  }

  productWriter.write([
    productId,
    entry.title,
    entry.brand,
    entry.image[0],
    entry.price,
  ]);

  console.log("Processed " + productCount + " entries");
});

dataStream.on("end", () => {
  productWriter.end();
  categoryWriter.end();
  productCategoryWriter.end();

  console.log("Finished!");
});
