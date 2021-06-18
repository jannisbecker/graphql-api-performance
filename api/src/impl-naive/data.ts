import { getRepository } from "typeorm";
import { Category } from "../model/Category";
import { Product } from "../model/Product";

const productsRepository = getRepository(Product);

async function getProducts(offset: number, limit: number): Promise<Product[]> {
  return productsRepository.find({ skip: offset, take: limit });
}

// async function getCategories(): Promise<Category[]> {
//   return categoriesRepository.find({ take: 100 });
// }

export { getProducts };
