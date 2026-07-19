import slugify from 'slugify';

export class AppError extends Error {
  code;
  args;

  constructor(message, code = undefined, args = undefined) {
    super(message);

    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, AppError);
    }

    this.name = this.constructor.name;
    this.code = typeof code === 'string' && code.length ? code : slugify((message || 'unknown').toUpperCase(), {
      replacement: '_',
      remove: /[^a-zA-Z\d\s-]/g
    });
    this.args = args;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      args: this.args
    };
  }
}

export const throwAppError = (message, code = undefined, args = undefined) => {
  throw new AppError(message, code, args);
};

// duracak