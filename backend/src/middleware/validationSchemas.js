const { z } = require('zod');

// Regex for Password: 8–16 chars, ≥1 uppercase letter, ≥1 special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const nameSchema = z.string()
  .min(20, { message: 'Name must be at least 20 characters long' })
  .max(60, { message: 'Name must be at most 60 characters long' });

const emailSchema = z.string()
  .email({ message: 'Must be a valid RFC email address' });

const addressSchema = z.string()
  .max(400, { message: 'Address must be at most 400 characters long' })
  .optional()
  .nullable()
  .or(z.literal(''));

const passwordSchema = z.string()
  .regex(PASSWORD_REGEX, {
    message: 'Password must be 8–16 characters, containing at least 1 uppercase letter and 1 special character.'
  });

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' })
});

const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['admin', 'user', 'owner'], { message: 'Role must be one of admin, user, or owner' })
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: 'Old password is required' }),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Confirm password is required' })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Pagination, sorting and filtering for Users
const listUsersQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => Math.max(1, parseInt(val, 10))),
  limit: z.string().optional().default('10').transform(val => Math.max(1, parseInt(val, 10))),
  sortBy: z.enum(['name', 'email', 'address', 'role', 'created_at']).optional().default('created_at'),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC').transform(val => val.toUpperCase()),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['admin', 'user', 'owner']).optional()
});

// Pagination, sorting and filtering for Stores
const listStoresQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => Math.max(1, parseInt(val, 10))),
  limit: z.string().optional().default('10').transform(val => Math.max(1, parseInt(val, 10))),
  sortBy: z.enum(['name', 'address', 'created_at', 'avg_rating']).optional().default('name'),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC').transform(val => val.toUpperCase()),
  name: z.string().optional(),
  address: z.string().optional()
});

// Create Store schema
const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  owner_id: z.number().int().positive().nullable().optional()
});

// Submit Rating schema
const submitRatingSchema = z.object({
  store_id: z.number().int().positive({ message: 'store_id must be a positive integer' }),
  value: z.number().int().min(1).max(5, { message: 'Rating value must be between 1 and 5' })
});

// Update Rating schema
const updateRatingSchema = z.object({
  value: z.number().int().min(1).max(5, { message: 'Rating value must be between 1 and 5' })
});

module.exports = {
  registerSchema,
  loginSchema,
  createUserSchema,
  changePasswordSchema,
  listUsersQuerySchema,
  listStoresQuerySchema,
  createStoreSchema,
  submitRatingSchema,
  updateRatingSchema
};
