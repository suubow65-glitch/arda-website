export default function PageHero({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="container-arda max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-relief">
          {kicker}
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 text-base text-white/80 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
