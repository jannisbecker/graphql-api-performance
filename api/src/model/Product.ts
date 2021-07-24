import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Category } from "./Category";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  brand!: string;

  @Column({ type: "decimal" })
  price!: number;

  @Column()
  image_url!: string;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable()
  categories!: Category[];
}
