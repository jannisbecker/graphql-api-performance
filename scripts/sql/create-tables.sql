CREATE TABLE IF NOT EXISTS products (
  id INT,
  title TEXT,
  brand TEXT,
  image_url TEXT,
  price TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS categories (
  id INT,
  name TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id INT,
  category_id INT,
  CONSTRAINT fk_product
    FOREIGN KEY(product_id) 
      REFERENCES products(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_category
    FOREIGN KEY(category_id) 
      REFERENCES categories(id)
      ON DELETE CASCADE
);