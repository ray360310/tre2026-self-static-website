import { PersonCard } from "../../components/PersonCard";
import type { AppData, PendingCardBenefitPreference } from "../../types/data";

interface CardBenefitPanelProps {
  data: AppData;
  preference: PendingCardBenefitPreference;
}

const cardLabels = {
  gold: "金卡待安排",
  silver: "銀卡待安排"
} as const;

export function CardBenefitPanel({ data, preference }: CardBenefitPanelProps) {
  const preferredPeople = preference.preferredPeopleIds
    .map((personId) => data.peopleById[personId])
    .filter((person) => person !== undefined);

  return (
    <section className="space-y-3 rounded-[1.5rem] bg-amber-50 px-4 py-4 ring-1 ring-amber-100">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{cardLabels[preference.cardType]}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          {preference.cardType === "gold" ? "Gold Card" : "Silver Card"}
        </span>
      </div>
      {preferredPeople.length > 0 ? (
        <div className="space-y-2">
          {preferredPeople.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-600">尚未設定指定人選。</p>
      )}
      {preference.desiredTimeSlots.length > 0 ? (
        <p className="text-sm text-slate-600">希望時段：{preference.desiredTimeSlots.join("、")}</p>
      ) : null}
      {preference.notes ? <p className="text-sm text-slate-600">{preference.notes}</p> : null}
    </section>
  );
}
