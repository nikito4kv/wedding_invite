import {
  alcoholPreferences,
  attendanceOptions,
  guestFormatOptions,
  type AlcoholPreference,
  type AttendanceValue,
  type GuestFormatValue
} from '@/lib/constants/rsvp';
import type {
  CanonicalRsvpPayload,
  RsvpFieldErrors,
  ValidationErrorResponse
} from '@/lib/rsvp/types';

const validationMessage = 'Пожалуйста, проверьте заполнение формы и попробуйте ещё раз.';

const attendanceValues = new Set<AttendanceValue>(attendanceOptions.map((option) => option.value));
const guestModeValues = new Set<GuestFormatValue>(guestFormatOptions.map((option) => option.value));
const alcoholValues = new Set<AlcoholPreference>(alcoholPreferences);
const otherAlcoholPreference: AlcoholPreference = 'Другое';

export type RsvpValidationResult =
  | {
      success: true;
      data: CanonicalRsvpPayload;
    }
  | {
      success: false;
      error: ValidationErrorResponse['error'];
    };

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const createValidationError = (
  fieldErrors: RsvpFieldErrors
): ValidationErrorResponse['error'] => ({
  type: 'validation',
  message: validationMessage,
  fieldErrors
});

export const validateCanonicalRsvpPayload = (input: unknown): RsvpValidationResult => {
  if (!isRecord(input)) {
    return {
      success: false,
      error: createValidationError({
        body: 'Не удалось прочитать данные формы. Обновите страницу и попробуйте снова.'
      })
    };
  }

  const fieldErrors: RsvpFieldErrors = {};
  const fullName = getTrimmedString(input.fullName);

  if (!fullName) {
    fieldErrors.fullName = 'Укажите ваше имя и фамилию.';
  }

  const attendance = input.attendance;

  if (typeof attendance !== 'string' || !attendanceValues.has(attendance as AttendanceValue)) {
    fieldErrors.attendance = 'Выберите, сможете ли вы присутствовать.';
  }

  const guestMode = input.guestMode;

  if (typeof guestMode !== 'string' || !guestModeValues.has(guestMode as GuestFormatValue)) {
    fieldErrors.guestMode = 'Выберите, придёте ли вы один / одна или с парой.';
  }

  const plusOneName = getTrimmedString(input.plusOneName);
  const requiresPlusOneName = attendance === 'yes' && guestMode === 'plusOne';

  if (requiresPlusOneName && !plusOneName) {
    fieldErrors.plusOneName = 'Укажите имя и фамилию вашего гостя.';
  }

  const rawAlcoholPreferences = input.alcoholPreferences;

  if (!Array.isArray(rawAlcoholPreferences) || rawAlcoholPreferences.length === 0) {
    fieldErrors.alcoholPreferences = 'Выберите хотя бы один вариант по алкоголю.';
  }

  const normalizedAlcoholPreferences = Array.isArray(rawAlcoholPreferences)
    ? rawAlcoholPreferences.filter(
        (value): value is AlcoholPreference =>
          typeof value === 'string' && alcoholValues.has(value as AlcoholPreference)
      )
    : [];

  if (
    Array.isArray(rawAlcoholPreferences) &&
    rawAlcoholPreferences.length > 0 &&
    (normalizedAlcoholPreferences.length !== rawAlcoholPreferences.length || normalizedAlcoholPreferences.length === 0)
  ) {
    fieldErrors.alcoholPreferences = 'Выберите варианты только из предложенного списка.';
  }

  const hasOtherAlcoholPreference = normalizedAlcoholPreferences.includes(otherAlcoholPreference);
  const alcoholPreferenceOther = getTrimmedString(input.alcoholPreferenceOther);

  if (hasOtherAlcoholPreference && !alcoholPreferenceOther) {
    fieldErrors.alcoholPreferenceOther = 'Уточните, пожалуйста, какой напиток вам ближе.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: createValidationError(fieldErrors)
    };
  }

  const normalizedPayload: CanonicalRsvpPayload = {
    fullName: fullName!,
    attendance: attendance as AttendanceValue,
    guestMode: guestMode as GuestFormatValue,
    plusOneName: requiresPlusOneName ? plusOneName! : undefined,
    alcoholPreferences: normalizedAlcoholPreferences
  };

  if (hasOtherAlcoholPreference) {
    normalizedPayload.alcoholPreferenceOther = alcoholPreferenceOther!;
  }

  return {
    success: true,
    data: normalizedPayload
  };
};
