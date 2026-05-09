import type {
  AlcoholPreference,
  AttendanceValue,
  GuestFormatValue
} from '@/lib/constants/rsvp';

export interface CanonicalRsvpPayload {
  fullName: string;
  attendance: AttendanceValue;
  guestMode: GuestFormatValue;
  plusOneName?: string;
  alcoholPreferences: AlcoholPreference[];
  alcoholPreferenceOther?: string;
}

export type RsvpErrorField =
  | 'body'
  | 'fullName'
  | 'attendance'
  | 'guestMode'
  | 'plusOneName'
  | 'alcoholPreferences'
  | 'alcoholPreferenceOther';

export type RsvpFieldErrors = Partial<Record<RsvpErrorField, string>>;

export interface ValidationErrorResponse {
  ok: false;
  error: {
    type: 'validation';
    message: string;
    fieldErrors: RsvpFieldErrors;
  };
}

export interface TelegramErrorResponse {
  ok: false;
  error: {
    type: 'telegram';
    message: string;
  };
}

export interface RsvpSuccessResponse {
  ok: true;
  message: string;
}

export type RsvpRouteResponse =
  | RsvpSuccessResponse
  | ValidationErrorResponse
  | TelegramErrorResponse;

export interface TelegramSendMessagePayload {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML';
  disable_web_page_preview: true;
}

export interface StoredRsvpSubmission extends CanonicalRsvpPayload {
  id: string;
  submittedAt: string;
  guestCount: number;
  deletedAt?: string;
  deleteBatchId?: string;
}
