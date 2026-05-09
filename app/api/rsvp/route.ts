import {
  createValidationError,
  saveRsvpSubmission,
  sendTelegramRsvp,
  type RsvpRouteResponse,
  validateCanonicalRsvpPayload
} from '@/lib/rsvp';

export const runtime = 'nodejs';

const successMessage = 'Спасибо! Мы получили ваш ответ и свяжемся, если понадобятся детали.';

const jsonResponse = (body: RsvpRouteResponse, status: number): Response => {
  return Response.json(body, { status });
};

export const POST = async (request: Request): Promise<Response> => {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: createValidationError({
          body: 'Не удалось прочитать данные формы. Обновите страницу и попробуйте снова.'
        })
      },
      400
    );
  }

  const validationResult = validateCanonicalRsvpPayload(requestBody);

  if (!validationResult.success) {
    return jsonResponse(
      {
        ok: false,
        error: validationResult.error
      },
      400
    );
  }

  const telegramResult = await sendTelegramRsvp(validationResult.data);

  if (!telegramResult.ok) {
    return jsonResponse(
      {
        ok: false,
        error: telegramResult.error
      },
      telegramResult.status
    );
  }

  await saveRsvpSubmission(validationResult.data);

  return jsonResponse(
    {
      ok: true,
      message: successMessage
    },
    200
  );
};
