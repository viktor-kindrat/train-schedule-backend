export class EmailAlreadyTakenError extends Error {
  constructor(email: string) {
    super(`Email already in use: ${email}`);
    this.name = 'EmailAlreadyTakenError';
  }
}

export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Email is invalid: ${email}`);
    this.name = 'InvalidEmailError';
  }
}

export class UserNotFoundError extends Error {
  constructor(id: number) {
    super(`User not found: ${id}`);
    this.name = 'UserNotFoundError';
  }
}
