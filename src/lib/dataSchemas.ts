import { z } from "zod";

import { EVENT_STATUSES, EVENT_TYPES } from "../types/data";

const optionalText = z.string().trim().min(1).nullable();
const dateText = z
  .string()
  .regex(/^\d{4}\/\d{2}\/\d{2}$/, "Expected YYYY/MM/DD")
  .refine((value) => {
    const [year, month, day] = value.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Expected a real calendar date");
const timeText = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Expected HH:MM")
  .refine((value) => {
    const [hours, minutes] = value.split(":").map(Number);

    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }, "Expected HH:MM within 00:00-23:59");

export const personSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  group: optionalText,
  bio: optionalText,
  tags: z.array(z.string().trim().min(1)),
  notes: optionalText,
  image: optionalText
});

export const eventSchema = z
  .object({
    id: z.string().trim().min(1),
    title: z.string().trim().min(1),
    date: dateText,
    start: timeText.nullable(),
    end: timeText.nullable(),
    type: z.enum(EVENT_TYPES),
    peopleIds: z.array(z.string().trim().min(1)),
    description: optionalText,
    location: optionalText,
    source: optionalText,
    status: z.enum(EVENT_STATUSES),
    notes: optionalText
  })
  .superRefine((event, ctx) => {
    if ((event.start === null) !== (event.end === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Timed events must provide both start and end times"
      });
      return;
    }

    if (event.start !== null && event.end !== null && event.start >= event.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time"
      });
    }
  });

export const cardOwnershipSchema = z.object({
  gold: z.number().int().nonnegative(),
  silver: z.number().int().nonnegative()
});

export const pendingCardBenefitPreferenceSchema = z.object({
  cardType: z.enum(["gold", "silver"]),
  preferredPeopleIds: z.array(z.string().trim().min(1)),
  desiredTimeSlots: z.array(z.string().trim().min(1)),
  notes: optionalText
});

export const myPlanSchema = z.object({
  ownedCards: cardOwnershipSchema,
  purchasedEventIds: z.array(z.string().trim().min(1)),
  candidateEventIds: z.array(z.string().trim().min(1)),
  pendingCardBenefitPreferences: z.array(pendingCardBenefitPreferenceSchema),
  preferredPeopleIds: z.array(z.string().trim().min(1)),
  preferredTimeSlotNotes: z.array(z.string().trim().min(1))
});

export const rulesSchema = z.object({
  overlapRequiresSameDate: z.literal(true),
  overlapRequiresTimeWindowIntersection: z.literal(true),
  goldCardConflictEventIds: z.array(z.string().trim().min(1)),
  silverCardConflictEventIds: z.array(z.string().trim().min(1))
});

export const peopleSchema = z.array(personSchema);
export const eventsSchema = z.array(eventSchema);
