import { getRepository } from "typeorm";
import { Category } from "../model/Category";
import { Product } from "../model/Product";

const productsRepository = getRepository(Product);
const categoriesRepository = getRepository(Category);

async function getProducts(offset: number, limit: number): Promise<Product[]> {
  return productsRepository
    .createQueryBuilder()
    .offset(offset)
    .limit(limit)
    .orderBy("id")
    .getMany();
}

async function getCategoriesForProduct(productId: number): Promise<Category[]> {
  return categoriesRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.products", "product")
    .where("product.id = :id", { id: productId })
    .getMany();
}

export { getProducts, getCategoriesForProduct };
