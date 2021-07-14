import { getRepository } from "typeorm";
import { Category } from "../model/Category";
import { Product } from "../model/Product";

const productsRepository = getRepository(Product);
const categoriesRepository = getRepository(Category);

async function getProductsPaginated(
  searchFromEnd: boolean,
  cursor: string | null,
  offset: number,
  limit: number
): Promise<Product[]> {
  // Erstelle den QueryBuilder und übergebe bereits das Limit
  let builder = productsRepository.createQueryBuilder("product").limit(limit);

  // Starte an der Position des gegebenen Cursors und suche die Elemente
  // je nach Suchrichtung vor oder nach dem Cursor
  if (cursor) {
    if (searchFromEnd) {
      builder = builder.where("product.id < :cursor", { cursor });
    } else {
      builder = builder.where("product.id > :cursor", { cursor });
    }
  }

  // Sofern ein Offset gegeben ist, übergebe es an den Query
  if (offset) {
    builder = builder.offset(offset);
  }

  // Lege die Sortierung je nach Suchrichtung fest
  if (searchFromEnd) {
    builder = builder.orderBy("product.id", "DESC");
  } else {
    builder = builder.orderBy("product.id", "ASC");
  }

  // Führe den Query aus
  return builder.getMany();
}

async function getCategoriesForProduct(productId: number): Promise<Category[]> {
  return categoriesRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.products", "product")
    .where("product.id = :id", { id: productId })
    .getMany();
}

export { getProductsPaginated, getCategoriesForProduct };
