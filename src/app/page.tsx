import { getTimelineContext } from "@/lib/auth-guard";
import { loadTimelineData } from "@/lib/data";
import { Timeline } from "@/components/Timeline";

export default async function HomePage() {
  const { isAdmin } = await getTimelineContext();
  const { entries, specialDates, isDemo, source } = await loadTimelineData();

  return (
    <main className="min-h-full flex-1 bg-transparent">
      <Timeline
        entries={entries}
        specialDates={specialDates}
        showAdminLink={isAdmin}
        isDemo={isDemo}
        dataSource={source}
      />
    </main>
  );
}
