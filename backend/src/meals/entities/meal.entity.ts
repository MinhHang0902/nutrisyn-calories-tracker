import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('jsonb')
  foods: {
    id: string;
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    sugar?: number;
    fiber?: number;
    sodium?: number;
    calcium?: number;
    iron?: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCalories: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalProtein: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCarbs: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalFat: number;

  @Column({ default: 'lunch' })
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @Column({ nullable: true })
  score: 'good' | 'moderate' | 'exceed';

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;
}
