import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TransactionType } from '../../../common/types';

@Entity('transactions')
@Index(['userId'])
@Index(['userId', 'type'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'user_id' })
  readonly userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  readonly type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  readonly amount: number;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;
}
