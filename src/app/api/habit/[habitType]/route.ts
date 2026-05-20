import { HttpError, authedHandler, type Validator } from '@/lib/api/handler';
import { insertHabitLog } from '@/lib/habit/habitRepository';

type Params = { habitType: string };

interface HabitLogBody {
  value?: number;
  metric?: string;
  extraData?: Record<string, unknown>;
}

const validateHabitLogBody: Validator<HabitLogBody> = (raw) => {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Invalid request body' };
  }
  return { ok: true, data: raw as HabitLogBody };
};

export const POST = authedHandler<HabitLogBody, Params>(
  { body: validateHabitLogBody },
  async ({ admin, userId, body, params }) => {
    const { habitType } = params;
    if (!['alcohol', 'exercise'].includes(habitType)) {
      throw new HttpError(400, 'Invalid habit type');
    }

    if (
      habitType === 'alcohol' &&
      body.extraData &&
      Array.isArray((body.extraData as { drinks?: unknown }).drinks)
    ) {
      throw new HttpError(
        501,
        'Alcohol multi-drink logging is not yet ported to Next. Use simple value/metric or Express locally.',
        'HABIT_ALCOHOL_EXTENSION_NOT_PORTED',
      );
    }

    const logId = await insertHabitLog(
      admin,
      userId,
      habitType,
      body.value ?? null,
      body.metric ?? null,
      body.extraData ?? {},
    );

    return { message: 'Habit logged successfully', logId };
  },
);
