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

  @Column()
  price!: string;

  @Column()
  image_url!: string;

  @ManyToMany(() => Category)
  @JoinTable()
  categories!: Category[];
}
