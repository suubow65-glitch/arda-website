import type { Metadata } from "next";
import {
  CheckCircle,
  HeartHandshake,
  HeartPulse,
  Leaf,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import FocusAreasGrid from "@/components/FocusAreasGrid";
import { boardMembers, leadership } from "@/data/mockData";
import { getAboutContent, getSiteSettings } from "@/lib/content";

const valueIcons: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "heart-handshake": HeartHandshake,
  "check-circle": CheckCircle,
  leaf: Leaf,
  users: Users,
  "heart-pulse": HeartPulse,
  scale: Scale,
  sparkles: Sparkles,
};

export const metadata: Metadata = {
  title: "About Us",
};

function PersonCard({
  name,
  role,
  bio,
}: {
  name: string;
  role: string;
  bio: string;
}) {
  const initials = name
    .split(" ")
    .filter((n) => /^[A-Za-z]/.test(n))
    .map((n) => n[0])
    .join("");

  return (
    <article className="rounded-2xl bg-navy p-6 text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-action font-display text-xl">
        {initials || "AR"}
      </div>
      <h3 className="mt-4 font-display text-2xl">{name}</h3>
      <p className="text-sm font-semibold text-relief">{role}</p>
      <p className="mt-3 text-sm text-white/75">{bio}</p>
    </article>
  );
}

export default async function AboutPage() {
  const about = await getAboutContent();
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        kicker="Who we are"
        title="About ARDA"
        description={settings.tagline}
      />

      <section className="py-16">
        <div className="container-arda">
          <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-card lg:p-10">
            <p className="section-kicker">Establishment</p>
            <h2 className="mt-2 font-display text-3xl text-navy">
              A Somali humanitarian and development organisation
            </h2>
            <p className="mt-4 leading-relaxed text-navy/70">
              {settings.name} was established in {settings.established} and is legally
              registered with the Federal Ministry of Interior (Ref{" "}
              <span className="font-semibold text-navy">#2123</span>) and the
              Southwest State Ministry of Planning, Investment and Economic
              Development (MoPIED Reg{" "}
              <span className="font-semibold text-navy">#6173</span>). Our
              headquarters is located at {settings.address}.
            </p>
            <p className="mt-4 leading-relaxed text-navy/70">
              ARDA is led by Executive Director{" "}
              <span className="font-semibold text-navy">
                {settings.executiveDirector}
              </span>{" "}
              and works across Southwest State and the Banadir Regional
              Administration to deliver relief and development programming in
              collaboration with communities, government, UN agencies and
              international partners.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda grid gap-8 lg:grid-cols-2">
          <article className="rounded-2xl bg-navy p-8 text-white">
            <p className="section-kicker text-relief">Vision</p>
            <h2 className="mt-2 font-display text-3xl">The Somalia we work toward</h2>
            <p className="mt-4 leading-relaxed text-white/80">{about.vision}</p>
          </article>
          <article className="rounded-2xl border border-navy/10 bg-white p-8 shadow-card">
            <p className="section-kicker">Mission</p>
            <h2 className="mt-2 font-display text-3xl text-navy">Why we exist</h2>
            <p className="mt-4 leading-relaxed text-navy/70">{about.mission}</p>
          </article>
        </div>
      </section>

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">Values</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Core Values</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {about.coreValues.map((value) => {
              const Icon = valueIcons[value.icon] ?? ShieldCheck;
              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-navy/10 p-6"
                >
                  <Icon className="h-8 w-8 text-relief" />
                  <h3 className="mt-4 font-display text-xl">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy/70">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda">
          <p className="section-kicker">Programmes</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Eight Core Thematic Pillars</h2>
          <div className="mt-8">
            <FocusAreasGrid compact />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">Leadership</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Executive Director</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <PersonCard
              name={settings.executiveDirector}
              role="Executive Director"
              bio="Provides overall leadership, strategic direction and donor engagement for ARDA, overseeing programmes across Southwest State and Banadir."
            />
            <article className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-relief">
                Coordination role
              </p>
              <h3 className="mt-2 font-display text-2xl text-navy">
                Area-Based Coordination (ABC) Co-Chair
              </h3>
              <p className="mt-3 text-sm text-navy/70">
                ARDA is the Co-Chair of the Area-Based Coordination (ABC)
                mechanism in Burhakaba District, providing leadership for
                humanitarian and development coordination with technical support
                from UN OCHA. This strengthens local response planning,
                information sharing and partnership alignment in Southwest
                State.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda">
          <p className="section-kicker">Governance</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Board of Directors</h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            ARDA is governed by a five-member Board of Directors that provides
            strategic direction, oversight and accountability.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {boardMembers.map((person) => (
              <PersonCard key={person.name} {...person} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">Management</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Senior Management</h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            Day-to-day implementation is led by four senior managers supported by
            more than 15 active volunteers in Baidoa, Burhakaba and surrounding
            districts.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {leadership.map((person) => (
              <PersonCard key={person.name} {...person} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda rounded-2xl bg-navy p-8 text-white lg:p-10">
          <h2 className="font-display text-3xl">Volunteer Network</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/80">
            More than 15 active volunteers support community mobilisation,
            hygiene promotion, nutrition screening, and protection awareness
            across Baidoa, Burhakaba and partner districts. Volunteers are a
            vital link between ARDA and the communities we serve.
          </p>
        </div>
      </section>
    </>
  );
}
