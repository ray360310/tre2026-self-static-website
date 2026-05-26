import { useEffect, useState } from "react";

import { EventCard } from "../../components/EventCard";
import type { AppData, EventRecord } from "../../types/data";
import { CatalogFilters } from "./CatalogFilters";

interface EventCatalogTabProps {
  data: AppData;
}

export function EventCatalogTab({ data }: EventCatalogTabProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedType, setSelectedType] = useState<EventRecord["type"] | "">("");
  const dates = [...new Set(data.events.map((event) => event.date))].sort();
  const people = Object.values(data.peopleById)
    .filter((person) => data.events.some((event) => event.peopleIds.includes(person.id)))
    .map((person) => ({ id: person.id, name: person.name }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const types = [...new Set(data.events.map((event) => event.type))].sort();

  useEffect(() => {
    if (selectedDate && !dates.includes(selectedDate)) {
      setSelectedDate("");
    }
  }, [dates, selectedDate]);

  useEffect(() => {
    if (selectedPersonId && !people.some((person) => person.id === selectedPersonId)) {
      setSelectedPersonId("");
    }
  }, [people, selectedPersonId]);

  useEffect(() => {
    if (selectedType && !types.includes(selectedType)) {
      setSelectedType("");
    }
  }, [selectedType, types]);

  const visibleEvents = data.events.filter((event) => {
    const matchesDate = selectedDate ? event.date === selectedDate : true;
    const matchesPerson = selectedPersonId
      ? event.peopleIds.includes(selectedPersonId)
      : true;
    const matchesType = selectedType ? event.type === selectedType : true;

    return matchesDate && matchesPerson && matchesType;
  });

  return (
    <div className="space-y-4">
      <CatalogFilters
        dates={dates}
        people={people}
        types={types}
        selectedDate={selectedDate}
        selectedPersonId={selectedPersonId}
        selectedType={selectedType}
        onDateChange={setSelectedDate}
        onPersonChange={setSelectedPersonId}
        onTypeChange={setSelectedType}
      />
      <section className="space-y-3">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} data={data} event={event} />
        ))}
      </section>
    </div>
  );
}
