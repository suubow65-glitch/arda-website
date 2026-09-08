import type { Metadata } from "next";
import ContactClientPage from "./ContactClientPage";

export const metadata: Metadata = {
  title: "Partner With Us - Action for Relief & Development Agency (ARDA)",
  description:
    "Partner with ARDA on relief and development programmes across Southwest State and Banadir, Somalia.",
};

export default function ContactPage() {
  return <ContactClientPage />;
}
