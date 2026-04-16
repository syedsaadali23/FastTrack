import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarRange, Trophy, Users2, Send, Bell, ShieldCheck } from "lucide-react";
import { DualLogos } from "@/components/common/DualLogos";
import { SportIcon } from "@/components/common/SportIcon";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const sports = ["Football", "Cricket", "Basketball", "Volleyball", "Table Tennis", "Badminton"];

const steps = [
  { icon: ShieldCheck, title: "Sign up & verify", desc: "Create your player or organizer account with your FAST roll number." },
  { icon: CalendarRange, title: "Discover events", desc: "Browse upcoming tournaments & register for individual events or as a team." },
  { icon: Trophy, title: "Compete & celebrate", desc: "Get live updates, manage your team, and track your sports journey." },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary py-20 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent-gold opacity-[0.05]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-light opacity-[0.05]" />
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-6">
            <DualLogos nucesHeight={56} fssHeight={64} crossSize={28} />
            <span className="badge badge-gold inline-block">FAST-NUCES × FSS Official Initiative</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground mt-5">FastTrack Sports Management</h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto text-base md:text-lg">
            One platform for every match, every team, every athlete at FAST-NUCES Lahore. Organize. Compete. Celebrate.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-primary-light">Get Started</Link>
            <Link to="/about" className="btn-outline border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Learn More</Link>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CalendarRange, label: "Events", val: "Live" },
            { icon: Users2, label: "Teams", val: "Real-time" },
            { icon: Send, label: "Notifications", val: "Instant" },
            { icon: Bell, label: "Updates", val: "24/7" },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><s.icon className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-base font-semibold text-primary">{s.val}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center text-primary">How it works</h2>
          <p className="text-center text-muted-foreground mt-2">From sign-up to silverware in three steps.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="card-nuces p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center"><s.icon className="h-6 w-6 text-primary" /></div>
                <h3 className="mt-4 text-lg font-semibold text-primary">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center text-primary">Our sports</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-10">
            {sports.map((name, i) => (
              <motion.div key={name} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="card-nuces p-5 text-center hover:shadow-md">
                <SportIcon sport={name} size={28} className="mx-auto text-primary-light" />
                <p className="mt-2 text-sm font-medium text-primary">{name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-primary">Built for FAST-NUCES Lahore</h2>
            <ul className="mt-5 space-y-3">
              {["Real-time event registration", "Team management with captains & rosters", "Notifications & broadcasts", "Role-based dashboards"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent-gold" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center md:text-left">
            <div className="h-20 w-20 rounded-full overflow-hidden mx-auto md:mx-0">
              <img src="/images/fss-logo.png" alt="FSS" className="w-full h-full object-cover scale-[1.25]" />
            </div>
            <p className="mt-4 text-muted-foreground">A joint initiative of the Fast Lahore Sports Society and the Office of Student Affairs.</p>
            <div className="mt-3 flex gap-2 justify-center md:justify-start flex-wrap">
              <span className="badge badge-fss">Sportsmanship</span>
              <span className="badge badge-fss">Excellence</span>
              <span className="badge badge-fss">Community</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
