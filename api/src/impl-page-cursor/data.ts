import e from "express";
import { buildDocumentFromTypeDefinitions } from "graphql-tools";
import { getRepository } from "typeorm";
import { Category } from "../model/Category";
import { Product } from "../model/Product";

const productsRepository = getRepository(Product);
const categoriesRepository = getRepository(Category);

async function getProductsPaginated(
  searchFromEnd: boolean,
  cursor: string | null,
  limit: number
): Promise<[Product[], number]> {
  let builder = productsRepository.createQueryBuilder("product").limit(limit);

  if (cursor) {
    if (searchFromEnd) {
      builder = builder.where("product.id < :cursor", { cursor });
    } else {
      builder = builder.where("product.id > :cursor", { cursor });
    }
  }

  if (searchFromEnd) {
    builder = builder.orderBy("product.id", "DESC");
  } else {
    builder = builder.orderBy("product.id", "ASC");
  }

  return builder.getManyAndCount();
}

async function getCategoriesForProduct(productId: number): Promise<Category[]> {
  return categoriesRepository
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.products", "product")
    .where("product.id = :id", { id: productId })
    .getMany();
}

export { getProductsPaginated, getCategoriesForProduct };
