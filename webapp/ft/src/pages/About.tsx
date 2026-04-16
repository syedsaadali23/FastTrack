import { DualLogos } from "@/components/common/DualLogos";

export default function About() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center">
        <DualLogos nucesHeight={48} fssHeight={56} crossSize={26} variant="light" />
        <h1 className="text-3xl font-extrabold text-primary mt-5">About FastTrack</h1>
      </div>
      <div className="mt-8 space-y-4 text-foreground">
        <p>FastTrack is the official sports management platform of <strong>FAST-NUCES Lahore</strong>, built in partnership with the <strong>Fast Lahore Sports Society (FSS)</strong>.</p>
        <p>The platform centralises event registration, team management, broadcasts, and tournament tracking — replacing scattered spreadsheets and group chats with a single source of truth.</p>
        <p>It supports three roles:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-primary">Players</strong> — browse events, register individually or as part of a team, manage your squad and notifications.</li>
          <li><strong className="text-primary">Organizers</strong> — create and manage tournaments, send notification requests to admins for approval.</li>
          <li><strong className="text-primary">Admins</strong> — oversee everything: events, broadcasts, organizer notifications, and user accounts.</li>
        </ul>
      </div>
    </section>
  );
}
