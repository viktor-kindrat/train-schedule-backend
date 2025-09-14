import 'dotenv/config';
import { Repository } from 'typeorm';
import { User } from '../users/infrastructure/persistence/typeorm/user.orm-entity';
import { AppDataSource } from '../utils/data-source';
import { hashPassword } from '../auth/utils/password.util';
import { Role } from '../users/domain/aggregates/user.aggregate';

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[seed-admin] Missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const email = envOrThrow('ADMIN_EMAIL').toLowerCase();
  const password = envOrThrow('ADMIN_PASSWORD');

  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';

  await AppDataSource.initialize();
  const usersRepo: Repository<User> = AppDataSource.getRepository(User);

  const existing = await usersRepo.findOne({ where: { email } });
  if (existing) {
    console.log(
      `[seed-admin] Admin already exists: ${email} (id=${existing.id})`,
    );
    await AppDataSource.destroy();
    process.exit(0);
  }

  const { hash, salt } = hashPassword(password);

  const admin = usersRepo.create({
    email,
    firstName,
    lastName,
    role: Role.admin,
    passwordHash: hash,
    passwordSalt: salt,
  });

  await usersRepo.save(admin);
  console.log(`[seed-admin] Admin created: ${email} (id=${admin.id})`);

  await AppDataSource.destroy();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('[seed-admin] Failed:', err);
  try {
    await AppDataSource.destroy();
  } catch {
    console.error('[seed-admin] Failed to destroy data source');
  }
  process.exit(1);
});
