import HeroSlider from "@/components/HeroSlider";
import ImpactBar from "@/components/ImpactBar";
import FocusAreasGrid from "@/components/FocusAreasGrid";
import RegionalCoverage from "@/components/RegionalCoverage";
import LatestActivities from "@/components/LatestActivities";
import DocumentsPreview from "@/components/DocumentsPreview";
import PartnersSection from "@/components/PartnersSection";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <ImpactBar />

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">What we do</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Focus Areas</h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            Multi-sector humanitarian and development programming tailored to
            drought, flood, conflict and displacement in Southern and Central
            Somalia.
          </p>
          <div className="mt-10">
            <FocusAreasGrid compact />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda">
          <p className="section-kicker">Where we work</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">
            Regional Coverage
          </h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            Field presence and partner networks across Banadir, Bay, Bakool,
            Hiiraan, Lower Shabelle and Jubaland — including Mogadishu, Baidoa,
            Kismayo, Beledweyne and Galkayo.
          </p>
          <div className="mt-10">
            <RegionalCoverage />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">From the field</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">
            Latest Activities
          </h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            Recent emergency and recovery projects reaching IDPs, host
            communities and rural households.
          </p>
          <div className="mt-10">
            <LatestActivities />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-arda">
          <p className="section-kicker">Transparency</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">
            Key Documents &amp; Publications
          </h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            Annual reports, policies and public accountability documents for
            partners and donors.
          </p>
          <div className="mt-10">
            <DocumentsPreview />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-arda">
          <p className="section-kicker">Collaboration</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Partners</h2>
          <p className="mt-3 max-w-2xl text-navy/70">
            ARDA works with UN agencies, clusters and peer NGOs. Logo
            placeholders below will be replaced with official partner artwork.
          </p>
          <div className="mt-10">
            <PartnersSection />
          </div>
        </div>
      </section>
    </>
  );
}
