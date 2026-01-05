/**
 * Input Validation Schemas using Zod
 * 
 * All API inputs should be validated before processing.
 * Use validateInput() helper to get type-safe parsed data.
 */
import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid('Invalid ID format');

export const dateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

export const isoDateSchema = z.string().datetime({ message: 'Invalid ISO date format' });

// ============================================
// Daily Log Schemas
// ============================================

export const createDailyLogSchema = z.object({
  date: dateSchema,
  rating: z.number().min(1).max(5).optional(),
});

export const updateDailyLogSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
});

// ============================================
// Workout Schemas
// ============================================

export const workoutTypeEnum = z.enum(['Mobility', 'Strength', 'Cardio', 'Yoga', 'HIIT', 'Other']);
export const intensityEnum = z.enum(['Low', 'Moderate', 'High']);

export const createWorkoutSchema = z.object({
  dailyLogId: uuidSchema,
  name: z.string().min(1).max(200).optional(),
  instructor: z.string().max(100).optional(),
  platform: z.string().max(100).optional(),
  duration: z.number().int().min(1).max(600).optional(), // Max 10 hours
  type: workoutTypeEnum.optional(),
  focusArea: z.string().max(100).optional(),
  intensity: intensityEnum.optional(),
  notes: z.string().max(2000).optional(),
});

export const updateWorkoutSchema = createWorkoutSchema.partial().omit({ dailyLogId: true });

// ============================================
// Photo Schemas
// ============================================

export const photoViewEnum = z.enum(['FRONT', 'SIDE', 'BACK']);

export const createPhotoSchema = z.object({
  dailyLogId: uuidSchema,
  url: z.string().url(),
  view: photoViewEnum.default('FRONT'),
  caption: z.string().max(500).optional(),
});

export const updatePhotoSchema = z.object({
  view: photoViewEnum.optional(),
  caption: z.string().max(500).optional(),
  analysis: z.string().optional(),
});

// ============================================
// Nutrition Schemas
// ============================================

export const createNutritionSchema = z.object({
  dailyLogId: uuidSchema,
  calories: z.number().int().min(0).max(10000).optional(),
  protein: z.number().int().min(0).max(500).optional(),
  carbs: z.number().int().min(0).max(1000).optional(),
  fat: z.number().int().min(0).max(500).optional(),
  fiber: z.number().int().min(0).max(100).optional(),
  mealsJson: z.string().optional(),
  microsJson: z.string().optional(),
});

export const updateNutritionSchema = createNutritionSchema.partial().omit({ dailyLogId: true });

export const createFoodItemSchema = z.object({
  nutritionId: uuidSchema,
  name: z.string().min(1).max(200),
  fdcId: z.string().optional(),
  servingSize: z.number().positive().optional(),
  servingUnit: z.string().max(50).optional(),
  calories: z.number().int().min(0).optional(),
  protein: z.number().int().min(0).optional(),
  carbs: z.number().int().min(0).optional(),
  fat: z.number().int().min(0).optional(),
  fiber: z.number().int().min(0).optional(),
});

// ============================================
// Check-in Schemas
// ============================================

export const createCheckInSchema = z.object({
  dailyLogId: uuidSchema,
  sleepHours: z.number().min(0).max(24).optional(),
  weight: z.number().min(50).max(500).optional(), // lbs reasonable range
  water: z.number().int().min(0).max(10000).optional(), // ml
  caffeine: z.string().max(200).optional(),
  alcohol: z.string().max(200).optional(),
  supplements: z.string().max(500).optional(),
  pain: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateCheckInSchema = createCheckInSchema.partial().omit({ dailyLogId: true });

// ============================================
// Dream Schemas
// ============================================

export const createDreamSchema = z.object({
  dailyLogId: uuidSchema,
  content: z.string().min(1).max(5000),
  mood: z.string().max(50).optional(),
  tags: z.string().max(200).optional(),
});

export const updateDreamSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  mood: z.string().max(50).optional(),
  tags: z.string().max(200).optional(),
  analysis: z.string().optional(),
});

// ============================================
// Protocol Schemas
// ============================================

export const protocolStatusEnum = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']);

export const createProtocolSchema = z.object({
  name: z.string().min(1).max(200),
  substance: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  startDate: dateSchema.optional(),
  status: protocolStatusEnum.default('ACTIVE'),
  notes: z.string().max(2000).optional(),
});

export const updateProtocolSchema = createProtocolSchema.partial();

export const createProtocolLogSchema = z.object({
  protocolId: uuidSchema,
  dailyLogId: uuidSchema.optional(),
  date: dateSchema.optional(),
  taken: z.boolean().default(true),
  headache: z.number().int().min(1).max(5).optional(),
  anxiety: z.number().int().min(1).max(5).optional(),
  sleepQuality: z.number().int().min(1).max(5).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});

// ============================================
// Chat Schemas
// ============================================

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(4000),
  context: z.string().max(10000).optional(),
});

// ============================================
// File Upload Schemas
// ============================================

export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const;

export const fileUploadSchema = z.object({
  filename: z.string().max(255),
  contentType: z.enum(allowedImageTypes),
  size: z.number().int().max(10 * 1024 * 1024), // 10MB max
});

// ============================================
// Measurement Schemas
// ============================================

export const createMeasurementSchema = z.object({
  dailyLogId: uuidSchema,
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hips: z.number().positive().optional(),
  leftArm: z.number().positive().optional(),
  rightArm: z.number().positive().optional(),
  leftThigh: z.number().positive().optional(),
  rightThigh: z.number().positive().optional(),
  leftCalf: z.number().positive().optional(),
  rightCalf: z.number().positive().optional(),
  neck: z.number().positive().optional(),
  shoulders: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

// ============================================
// Helper Functions
// ============================================

/**
 * Validate input against a Zod schema
 * Returns type-safe parsed data or error details
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError; message: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format error message for API response
  // Zod errors are in .issues property
  const message = result.error.issues
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
  
  return { success: false, error: result.error, message };
}

/**
 * Create a validation error response for Next.js API routes
 */
export function validationErrorResponse(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}

// Export types for use in API routes
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type CreateNutritionInput = z.infer<typeof createNutritionSchema>;
export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type CreateDreamInput = z.infer<typeof createDreamSchema>;
export type CreateProtocolInput = z.infer<typeof createProtocolSchema>;
export type CreateProtocolLogInput = z.infer<typeof createProtocolLogSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
