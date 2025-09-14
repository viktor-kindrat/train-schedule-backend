import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from '../../../domain/repositories/users.repository';
import { UserAggregate } from '../../../domain/aggregates/user.aggregate';
import { User } from './user.orm-entity';
import { toDomain } from './user.mapper';

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const qb = this.repo
      .createQueryBuilder('u')
      .where('u.email = :email', { email: email.toLowerCase() })
      .addSelect(['u.passwordHash', 'u.passwordSalt']);
    const row = await qb.getOne();
    return row ? toDomain(row) : null;
  }

  async findById(id: number): Promise<UserAggregate | null> {
    const qb = this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
      .addSelect(['u.passwordHash', 'u.passwordSalt']);
    const row = await qb.getOne();
    return row ? toDomain(row) : null;
  }

  async list(): Promise<UserAggregate[]> {
    const rows = await this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.passwordSalt'])
      .getMany();
    return rows.map(toDomain);
  }

  async save(user: UserAggregate): Promise<UserAggregate> {
    const snap = user.snapshot();
    await this.repo.manager.transaction(async (tx) => {
      const repo = tx.getRepository(User);
      const existing = snap.id
        ? await repo.findOne({ where: { id: snap.id } })
        : await repo.findOne({ where: { email: snap.email } });

      if (existing) {
        existing.firstName = snap.firstName;
        existing.lastName = snap.lastName;
        existing.email = snap.email;
        existing.role = snap.role;
        existing.passwordHash = snap.passwordHash;
        existing.passwordSalt = snap.passwordSalt;
        existing.lastLoginAt = snap.lastLoginAt
          ? new Date(snap.lastLoginAt)
          : null;
        await repo.save(existing);
      } else {
        const toCreate = repo.create({
          firstName: snap.firstName,
          lastName: snap.lastName,
          email: snap.email,
          role: snap.role,
          passwordHash: snap.passwordHash,
          passwordSalt: snap.passwordSalt,
          lastLoginAt: snap.lastLoginAt ? new Date(snap.lastLoginAt) : null,
        });
        await repo.save(toCreate);
      }
    });

    const saved = await this.findByEmail(snap.email);
    if (!saved) throw new Error('Failed to save user');
    return saved;
  }

  async updateLastLogin(id: number, at: Date): Promise<void> {
    await this.repo.update({ id }, { lastLoginAt: at });
  }
}
