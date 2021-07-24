import DataLoader from "dataloader";
import { getRepository } from "typeorm";
import { Category } from "../model/Category";

const categoriesRepository = getRepository(Category);

const categoryLoader = new DataLoader<number, Category[]>((keys) =>
  getCategoriesForProductIds(keys)
);

// Ersetzt getCategoriesForProduct um alle gebatchten Product IDs in einem Query in Kategorien aufzulösen
// das resultierende Array enthält in jedem Index ein Category Array welches zu der übergebenen productID im selben Index
// des productIDs Arrays passt. D.h. hier wird ein Array aus Product IDs in ein gleich großes und gleich sortiertes Array von Category[] überführt
async function getCategoriesForProductIds(
  productIds: readonly number[]
): Promise<Category[][]> {
  return categoriesRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.products", "product")
    .where("product.id = ANY(:ids)", { ids: productIds })
    .getMany()
    .then((results) =>
      productIds.map((prodId) =>
        results.filter((res) => res.products[0].id === prodId)
      )
    );
}

export { categoryLoader };
