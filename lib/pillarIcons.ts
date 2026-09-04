import {
  Apple,
  Droplets,
  GraduationCap,
  Handshake,
  HeartPulse,
  Leaf,
  Shield,
  Sprout,
  Stethoscope,
  Users,
  Globe,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  peace: Handshake,
  youth: Users,
  food: Sprout,
  agriculture: Sprout,
  education: GraduationCap,
  health: Stethoscope,
  nutrition: Apple,
  wash: Droplets,
  protection: Shield,
  gender: HeartPulse,
  climate: Leaf,
  environment: Leaf,
  globe: Globe,
};

export function getPillarIcon(name: string): LucideIcon {
  const key = name.toLowerCase().trim();
  return iconMap[key] || Globe;
}

export type { LucideIcon };
