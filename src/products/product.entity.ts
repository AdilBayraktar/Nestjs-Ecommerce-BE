import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP(6)';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 150 })
  name: string;
  @Column({ type: 'varchar', length: 500 })
  description: string;
  @Column({ type: 'float' })
  price: number;
  @Column({ default: 'https://placehold.co/400x400' })
  imageUrl: string;
  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updatedAt: Date;
}
