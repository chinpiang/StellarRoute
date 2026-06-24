import { Metadata } from "next";
import { SettingsPageClient } from "./SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings | StellarRoute",
  description:
    "Customize your StellarRoute experience with theme, language, and notification settings.",
  openGraph: {
    title: "Settings | StellarRoute",
    description: "Personalize your StellarRoute interface and preferences.",
    type: "website",
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
