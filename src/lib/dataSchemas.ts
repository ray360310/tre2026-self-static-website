import { z } from "zod";

import { EVENT_STATUSES, EVENT_TYPES } from "../types/data";

const optionalText = z.string().trim().min(1).nullable();
const dateText = z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "Expected YYYY/MM/DD");
const timeText = z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:MM");

export const personSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  group: optionalText,
  bio: optionalText,
  tags: z.array(z.string().trim().min(1)),
  notes: optionalText,
  image: optionalText
});

export const eventSchema = z.object({
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
