/**
 * @file validation.test.ts
 * @description Tests for Zod validation schemas
 */

import {
  validateInput,
  createWorkoutSchema,
  createPhotoSchema,
  createCheckInSchema,
  createDreamSchema,
  createProtocolSchema,
  chatMessageSchema,
  fileUploadSchema,
  uuidSchema,
  validationErrorResponse,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = uuidSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuid = 'not-a-uuid';
      const result = uuidSchema.safeParse(invalidUuid);
      expect(result.success).toBe(false);
    });

    it('should reject empty strings', () => {
      const result = uuidSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('createWorkoutSchema', () => {
    const validWorkout = {
      dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Morning Workout',
      duration: 45,
      type: 'Strength' as const,
      intensity: 'High' as const,
    };

    it('should accept valid workout data', () => {
      const result = validateInput(createWorkoutSchema, validWorkout);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Morning Workout');
      }
    });

    it('should reject invalid dailyLogId', () => {
      const result = validateInput(createWorkoutSchema, {
        ...validWorkout,
        dailyLogId: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject duration over 600 minutes', () => {
      const result = validateInput(createWorkoutSchema, {
        ...validWorkout,
        duration: 700,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid workout type', () => {
      const result = validateInput(createWorkoutSchema, {
        ...validWorkout,
        type: 'InvalidType',
      });
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be omitted', () => {
      const result = validateInput(createWorkoutSchema, {
        dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createPhotoSchema', () => {
    const validPhoto = {
      dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
      url: 'https://example.com/photo.jpg',
      view: 'FRONT' as const,
    };

    it('should accept valid photo data', () => {
      const result = validateInput(createPhotoSchema, validPhoto);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = validateInput(createPhotoSchema, {
        ...validPhoto,
        url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid view type', () => {
      const result = validateInput(createPhotoSchema, {
        ...validPhoto,
        view: 'TOP',
      });
      expect(result.success).toBe(false);
    });

    it('should default view to FRONT', () => {
      const result = validateInput(createPhotoSchema, {
        dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
        url: 'https://example.com/photo.jpg',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.view).toBe('FRONT');
      }
    });

    it('should reject caption over 500 characters', () => {
      const result = validateInput(createPhotoSchema, {
        ...validPhoto,
        caption: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createCheckInSchema', () => {
    const validCheckIn = {
      dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
      sleepHours: 7.5,
      weight: 180,
      water: 2000,
    };

    it('should accept valid check-in data', () => {
      const result = validateInput(createCheckInSchema, validCheckIn);
      expect(result.success).toBe(true);
    });

    it('should reject sleep hours over 24', () => {
      const result = validateInput(createCheckInSchema, {
        ...validCheckIn,
        sleepHours: 25,
      });
      expect(result.success).toBe(false);
    });

    it('should reject weight under 50', () => {
      const result = validateInput(createCheckInSchema, {
        ...validCheckIn,
        weight: 30,
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative water amount', () => {
      const result = validateInput(createCheckInSchema, {
        ...validCheckIn,
        water: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createDreamSchema', () => {
    it('should accept valid dream data', () => {
      const result = validateInput(createDreamSchema, {
        dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'I was flying over mountains',
        mood: 'Peaceful',
        tags: 'flying, mountains',
      });
      expect(result.success).toBe(true);
    });

    it('should require content', () => {
      const result = validateInput(createDreamSchema, {
        dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject content over 5000 characters', () => {
      const result = validateInput(createDreamSchema, {
        dailyLogId: '123e4567-e89b-12d3-a456-426614174000',
        content: 'a'.repeat(5001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProtocolSchema', () => {
    const validProtocol = {
      name: 'Testosterone Optimization',
      substance: 'Clomiphene',
      dosage: '25mg',
      frequency: 'E3D',
    };

    it('should accept valid protocol data', () => {
      const result = validateInput(createProtocolSchema, validProtocol);
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const result = validateInput(createProtocolSchema, {
        ...validProtocol,
        name: '',
      });
      expect(result.success).toBe(false);
    });

    it('should default status to ACTIVE', () => {
      const result = validateInput(createProtocolSchema, validProtocol);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('ACTIVE');
      }
    });
  });

  describe('chatMessageSchema', () => {
    it('should accept valid chat message', () => {
      const result = validateInput(chatMessageSchema, {
        message: 'I ate 12oz steak for lunch',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const result = validateInput(chatMessageSchema, {
        message: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject message over 4000 characters', () => {
      const result = validateInput(chatMessageSchema, {
        message: 'a'.repeat(4001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('fileUploadSchema', () => {
    it('should accept valid file upload', () => {
      const result = validateInput(fileUploadSchema, {
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid content type', () => {
      const result = validateInput(fileUploadSchema, {
        filename: 'document.pdf',
        contentType: 'application/pdf',
        size: 1024,
      });
      expect(result.success).toBe(false);
    });

    it('should reject file over 10MB', () => {
      const result = validateInput(fileUploadSchema, {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
        size: 11 * 1024 * 1024,
      });
      expect(result.success).toBe(false);
    });

    it('should accept allowed image types', () => {
      const types = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      types.forEach((contentType) => {
        const result = validateInput(fileUploadSchema, {
          filename: 'photo.jpg',
          contentType,
          size: 1024,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('validateInput helper', () => {
    it('should return success true with parsed data', () => {
      const result = validateInput(uuidSchema, '123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('should return success false with error message', () => {
      const result = validateInput(uuidSchema, 'invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toContain('Invalid ID format');
      }
    });
  });

  describe('validationErrorResponse', () => {
    it('should format error response correctly', () => {
      const result = uuidSchema.safeParse('invalid');
      if (!result.success) {
        const response = validationErrorResponse(result.error);
        expect(response.error).toBe('Validation failed');
        expect(response.details).toHaveLength(1);
        expect(response.details[0].message).toContain('Invalid ID format');
      }
    });
  });
});
