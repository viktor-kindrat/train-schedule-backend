import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

import {Role} from "../../../domain/aggregates/user.aggregate";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100 })
  firstName: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  email: string;

  @Column({ type: 'enum', enum: Role, default: Role.user })
  role: Role;

  @Column({ select: false })
  passwordHash: string;

  @Column({ select: false })
  passwordSalt: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
