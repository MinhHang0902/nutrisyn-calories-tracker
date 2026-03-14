import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ default: 'male' })
  gender: 'male' | 'female';

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ default: 'sedentary' })
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

  @Column({ default: 'maintain' })
  goal: 'lose_weight' | 'gain_muscle' | 'maintain';

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bmr: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  tdee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calorieTarget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  proteinTarget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carbsTarget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fatTarget: number;

  @CreateDateColumn()
  updatedAt: Date;
}
