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
  let builder = productsRepository.createQueryBuilder("product").limit(limit);

  // Jump to given cursor and search either before or after it
  if (cursor) {
    if (searchFromEnd) {
      builder = builder.where("product.id < :cursor", { cursor });
    } else {
      builder = builder.where("product.id > :cursor", { cursor });
    }
  }

  // Jump away from cursor by given offset, if set
  if (offset) {
    builder = builder.offset(offset);
  }

  // Order the results according to the given search direction
  if (searchFromEnd) {
    builder = builder.orderBy("product.id", "DESC");
  } else {
    builder = builder.orderBy("product.id", "ASC");
  }

  // Return results
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
