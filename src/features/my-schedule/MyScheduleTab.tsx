import { PersonCard } from "../../components/PersonCard";
import { EventCard } from "../../components/EventCard";
import type { AppData } from "../../types/data";
import { CardBenefitPanel } from "./CardBenefitPanel";

interface MyScheduleTabProps {
  data: AppData;
}

export function MyScheduleTab({ data }: MyScheduleTabProps) {
  const preferredPeople = data.myPlan.preferredPeopleIds
    .map((personId) => data.peopleById[personId])
    .filter((person) => person !== undefined);

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        {data.purchasedEvents.map((event) => (
          <EventCard key={event.id} data={data} event={event} />
        ))}
      </section>
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">卡片福利</h3>
          <p className="text-sm text-slate-500">保留待選時段，避免和已購活動撞期。</p>
        </div>
        {data.myPlan.pendingCardBenefitPreferences.map((preference) => (
          <CardBenefitPanel
            key={preference.cardType}
            data={data}
            preference={preference}
          />
        ))}
      </section>
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">想選的人與時段</h3>
          <p className="text-sm text-slate-500">先把理想人選與時段寫在這裡，之後再比對衝突。</p>
        </div>
        {preferredPeople.length > 0 ? (
          <div className="space-y-2">
            {preferredPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">尚未設定想選的人員。</p>
        )}
        {data.myPlan.preferredTimeSlotNotes.length > 0 ? (
          <ul className="space-y-2 rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600 ring-1 ring-slate-200">
            {data.myPlan.preferredTimeSlotNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
