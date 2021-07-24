import { getRepository } from "typeorm";
import { Category } from "../model/Category";
import { Product } from "../model/Product";

const productsRepository = getRepository(Product);

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

  // Lege die Sortierung fest und führe den Query aus.
  // In umgekehrter Suchrichtung die Sortierung umgedreht, limitiert und dann wieder umgedreht werden,
  // da es in SQL kein LIMIT vom Ende der Ergebnisse gibt
  if (searchFromEnd) {
    return builder
      .orderBy("product.id", "DESC")
      .getMany()
      .then((entries) => entries.reverse());
  } else {
    return builder.orderBy("product.id", "ASC").getMany();
  }
}

export { getProductsPaginated };
