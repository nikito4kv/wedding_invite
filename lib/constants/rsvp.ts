export const alcoholPreferences = [
  'Красное вино',
  'Белое вино',
  'Игристое',
  'Виски',
  'Без алкоголя',
  'Другое'
] as const;

export const attendanceOptions = [
  {
    value: 'yes',
    label: 'С радостью приду'
  },
  {
    value: 'no',
    label: 'К сожалению, не смогу'
  }
] as const;

export const guestFormatOptions = [
  {
    value: 'solo',
    label: 'Приду один / одна'
  },
  {
    value: 'plusOne',
    label: 'Приду с парой'
  }
] as const;

export type AlcoholPreference = (typeof alcoholPreferences)[number];
export type AttendanceValue = (typeof attendanceOptions)[number]['value'];
export type GuestFormatValue = (typeof guestFormatOptions)[number]['value'];
