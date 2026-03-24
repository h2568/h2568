import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { siteConfig } from "@/lib/config";

const SERVICES = [
  {
    title: "Crew Boss / Site Supervisors",
    desc: "Experienced crew bosses who keep your site safe, on schedule and running to plan.",
    icon: "🦺",
  },
  {
    title: "Scenic & Build Crew",
    desc: "Skilled hands for set construction, rigging, load-in and load-out on any scale.",
    icon: "🔨",
  },
  {
    title: "Event & Scenic Carpenters",
    desc: "Qualified carpenters for bespoke builds, staging and scenic fabrication.",
    icon: "🪚",
  },
  {
    title: "Festival & Touring Crew",
    desc: "Battle-hardened crew for multi-day festivals, arena tours and stadium shows.",
    icon: "🎪",
  },
  {
    title: "Telehandler Operators",
    desc: "CPCS-qualified telehandler operators — safe, efficient, fully certificated.",
    icon: "🚜",
  },
];

const WHY = [
  { label: "Fast response", detail: "Enquiries answered the same working day." },
  { label: "London & Manchester", detail: "Crews on the ground in both cities." },
  { label: "Fully vetted", detail: "Every crew member checked and experienced." },
  { label: "Flexible numbers", detail: "One crew boss or fifty hands — we scale." },
];

export default function HomePage() {
  return (
    <>
      {/* ── NAV ── */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" aria-label="Vantor Crew — home">
            <Image
              src="/vantor-logo.svg"
              alt="Vantor Crew"
              width={110}
              height={52}
              priority
              className="h-10 w-auto"
            />
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${siteConfig.phone}`}
              className="hidden sm:block text-sm text-muted hover:text-white transition-colors font-medium"
            >
              {siteConfig.phoneDisplay}
            </a>
            <a
              href={`tel:${siteConfig.phone}`}
              className="bg-accent text-bg px-4 py-2 rounded font-heading font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Call Now
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative grid-texture bg-bg overflow-hidden">
        {/* gold bar top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />
        <div className="max-w-6xl mx-auto px-5 py-24 md:py-36">
          <div className="max-w-3xl">
            <p className="text-accent font-heading font-semibold text-sm tracking-widest uppercase mb-4">
              London &amp; Manchester
            </p>
            <h1 className="font-heading font-bold text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
              Presence.<br />
              Power.<br />
              <span className="text-accent">Precision.</span>
            </h1>
            <p className="text-muted text-lg md:text-xl leading-relaxed max-w-xl mb-10">
              Professional event crew when you need them. Crew bosses, scenic builders,
              carpenters, festival &amp; touring crew, and telehandler operators — vetted,
              experienced, and ready to deploy.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${siteConfig.phone}`}
                className="bg-accent text-bg px-6 py-3 rounded font-heading font-bold text-sm hover:opacity-90 transition-opacity"
              >
                📞 Call {siteConfig.phoneDisplay}
              </a>
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-6 py-3 rounded font-heading font-bold text-sm hover:opacity-90 transition-opacity"
              >
                💬 WhatsApp
              </a>
              <a
                href="#enquire"
                className="border border-border text-white px-6 py-3 rounded font-heading font-semibold text-sm hover:border-accent/50 transition-colors"
              >
                Send Enquiry ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY VANTOR ── */}
      <section className="border-y border-border bg-bg2">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {WHY.map(({ label, detail }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="font-heading font-bold text-sm text-white">{label}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed pl-3.5">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="mb-12">
          <p className="text-accent font-heading font-semibold text-xs tracking-widest uppercase mb-3">
            What we supply
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl">
            Crew for every role
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="border border-border rounded-lg p-6 hover:border-accent/40 transition-colors"
            >
              <span className="text-2xl mb-4 block">{icon}</span>
              <h3 className="font-heading font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
          {/* sixth card — CTA */}
          <div className="border border-accent/30 bg-accent/5 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <span className="text-2xl mb-4 block">📋</span>
              <h3 className="font-heading font-bold text-base mb-2">Mixed crew package</h3>
              <p className="text-sm text-muted leading-relaxed">
                Need a combination of roles? We build bespoke packages around your event.
              </p>
            </div>
            <a
              href="#enquire"
              className="mt-6 inline-block text-accent font-heading font-bold text-sm hover:underline"
            >
              Get a quote →
            </a>
          </div>
        </div>
      </section>

      {/* ── DIRECT CONTACT BAR ── */}
      <section className="bg-accent">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-heading font-bold text-bg text-lg text-center sm:text-left">
            Need crew fast? Call Harry directly.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <a
              href={`tel:${siteConfig.phone}`}
              className="bg-bg text-white px-5 py-2.5 rounded font-heading font-bold text-sm hover:bg-bg2 transition-colors"
            >
              📞 {siteConfig.phoneDisplay}
            </a>
            <a
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-5 py-2.5 rounded font-heading font-bold text-sm hover:opacity-90 transition-opacity"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── ENQUIRY FORM ── */}
      <section id="enquire" className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* left copy */}
          <div className="lg:col-span-2">
            <p className="text-accent font-heading font-semibold text-xs tracking-widest uppercase mb-3">
              Check availability
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
              Send an enquiry
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Fill in the form and Harry will get back to you the same working day.
              No obligation — just a straight conversation about what you need.
            </p>
            <div className="space-y-4 text-sm">
              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center gap-3 text-muted hover:text-white transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-bg2 border border-border flex items-center justify-center text-base">📞</span>
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 text-muted hover:text-white transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-bg2 border border-border flex items-center justify-center text-base">✉️</span>
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted hover:text-white transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-bg2 border border-border flex items-center justify-center text-base">💬</span>
                WhatsApp
              </a>
              <a
                href={siteConfig.linkedinCompany}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted hover:text-white transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-bg2 border border-border flex items-center justify-center text-base">🔗</span>
                LinkedIn
              </a>
            </div>
          </div>
          {/* form */}
          <div className="lg:col-span-3 bg-bg2 border border-border rounded-xl p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <Image
                src="/vantor-logo.svg"
                alt="Vantor Crew"
                width={100}
                height={48}
                className="h-12 w-auto opacity-90"
              />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted">
              <a href={`tel:${siteConfig.phone}`} className="hover:text-white transition-colors">
                {siteConfig.phoneDisplay}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors">
                {siteConfig.email}
              </a>
              <a href={siteConfig.linkedinCompany} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted/50">
            <p>© {new Date().getFullYear()} Vantor Crew Ltd. All rights reserved.</p>
            <p>{siteConfig.url}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
