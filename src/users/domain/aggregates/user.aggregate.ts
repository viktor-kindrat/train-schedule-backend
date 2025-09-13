import { InvalidEmailError } from '../errors/user.errors';

export enum Role {
  admin = 'admin',
  user = 'user',
}

export class UserId {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value)) throw new Error('UserId must be an integer');
  }
}

export class Email {
  private constructor(public readonly value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new InvalidEmailError(value);
    }
  }
  static of(value: string) {
    return new Email(value.trim().toLowerCase());
  }
}

export class PasswordSecret {
  private constructor(
    public readonly hash: string,
    public readonly salt: string,
  ) {}
  static of(hash: string, salt: string) {
    if (!hash || !salt)
      throw new Error('Password secret must have hash and salt');
    return new PasswordSecret(hash, salt);
  }
}

export class UserAggregate {
  private constructor(
    private readonly _id: UserId,
    private _lastName: string,
    private _firstName: string,
    private _email: Email,
    private _role: Role,
    private _secret: PasswordSecret,
    private _lastLoginAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static createNew(params: {
    id: number;
    lastName: string;
    firstName: string;
    email: string;
    role: Role;
    secret: { hash: string; salt: string };
    createdAt?: Date;
  }): UserAggregate {
    if (!params.lastName?.trim()) throw new Error('Last name is required');
    if (!params.firstName?.trim()) throw new Error('First name is required');

    const createdAt = params.createdAt ?? new Date();

    return new UserAggregate(
      new UserId(params.id),
      params.lastName.trim(),
      params.firstName.trim(),
      Email.of(params.email),
      params.role,
      PasswordSecret.of(params.secret.hash, params.secret.salt),
      null,
      createdAt,
    );
  }

  static restore(snapshot: UserSnapshot): UserAggregate {
    return new UserAggregate(
      new UserId(snapshot.id),
      snapshot.lastName,
      snapshot.firstName,
      Email.of(snapshot.email),
      snapshot.role,
      PasswordSecret.of(snapshot.passwordHash, snapshot.passwordSalt),
      snapshot.lastLoginAt ? new Date(snapshot.lastLoginAt) : null,
      new Date(snapshot.createdAt),
    );
  }

  markLoggedIn(at: Date = new Date()) {
    this._lastLoginAt = at;
  }

  get id() {
    return this._id;
  }
  get email() {
    return this._email;
  }
  get role() {
    return this._role;
  }

  snapshot(): UserSnapshot {
    return {
      id: this._id.value,
      lastName: this._lastName,
      firstName: this._firstName,
      email: this._email.value,
      role: this._role,
      passwordHash: this._secret.hash,
      passwordSalt: this._secret.salt,
      lastLoginAt: this._lastLoginAt ? this._lastLoginAt.toISOString() : null,
      createdAt: this._createdAt.toISOString(),
    };
  }
}

export type UserSnapshot = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  role: Role;
  passwordHash: string;
  passwordSalt: string;
  lastLoginAt: string | null;
  createdAt: string;
};
