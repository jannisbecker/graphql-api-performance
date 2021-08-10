import DataLoader from "dataloader";
import { getRepository } from "typeorm";
import { Category } from "../model/Category";

const categoriesRepository = getRepository(Category);

// Definition des Dataloaders für die Auflösung der Kategorie-Relation
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
    .then((results) => {
      // Das Array aus Kategorien mit zugehörigen Produkten muss in ein Array aus Produkten mit zugehörigen Kategorien
      // umgeformt werden. Hierzu wird ein Objekt gebaut, bei dem jeder Key eine productId darstellt, und jede Value ist ein leeres Array
      const productCategories = productIds.reduce((obj, id) => {
        obj[id] = [];
        return obj;
      }, {} as Record<number, Category[]>);

      // Nun werden die Kategorien aus den results dem Objekt zugeordnet
      results.forEach((category) => {
        category.products.forEach((product) => {
          productCategories[product.id].push(category);
        });
      });

      // Und zurück in ein Array überführt
      return Object.values(productCategories);
    });
}

export { categoryLoader };
