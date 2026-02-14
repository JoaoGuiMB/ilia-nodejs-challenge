import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ name: 'first_name', length: 100 })
  readonly firstName: string;

  @Column({ name: 'last_name', length: 100 })
  readonly lastName: string;

  @Column({ unique: true })
  readonly email: string;

  @Column()
  readonly password: string;

  @CreateDateColumn({ name: 'created_at' })
  readonly createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  readonly updatedAt: Date;
}
