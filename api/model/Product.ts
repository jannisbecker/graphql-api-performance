import { Column, Model, Table } from "sequelize-typescript";

@Table({
  timestamps: false,
})
export class Product extends Model {
  @Column
  title?: string;

  @Column
  brand?: string;

  @Column
  price?: string;

  @Column
  image_url?: string;
}
