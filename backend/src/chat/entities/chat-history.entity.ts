import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_history')
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  userMessage: string;

  @Column({ type: 'text' })
  assistantMessage: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
