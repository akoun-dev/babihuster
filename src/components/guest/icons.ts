/**
 * Mapping icônes Lucide pour les noms d'icônes portés par les données du jeu
 * (`data.ts` : zones, actions, transports, PNJ, missions, événements).
 * Acteur : JOUEUR (guest). Le moteur et les données ne connaissent que des
 * strings — l'UI résout ici, avec fallback `Circle` si nom inconnu.
 *
 * Vérifié contre lucide-react 0.525 (tous les exports existent, y compris les
 * alias `HelpCircle` et `ShoppingBasket` requis par data.ts).
 */

import { createElement } from "react";
import {
  Bed,
  BedDouble,
  Bike,
  BookOpen,
  Bus,
  Circle,
  CloudRain,
  Coins,
  Cookie,
  CookingPot,
  Crown,
  CupSoda,
  Drumstick,
  Droplets,
  Eye,
  Fish,
  Flag,
  Footprints,
  HandHeart,
  HardHat,
  HelpCircle,
  Home,
  LightbulbOff,
  MapPin,
  MessageCircle,
  Moon,
  MoonStar,
  Music,
  Package,
  PartyPopper,
  PiggyBank,
  Save,
  SendToBack,
  ShieldAlert,
  Shirt,
  ShoppingBasket,
  ShowerHead,
  Sparkles,
  Store,
  Sun,
  SunMedium,
  Sunset,
  Swords,
  TrafficCone,
  UserRound,
  Users,
  Volleyball,
  Wrench,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Bed,
  BedDouble,
  Bike,
  BookOpen,
  Bus,
  Circle,
  CloudRain,
  Coins,
  Cookie,
  CookingPot,
  Crown,
  CupSoda,
  Drumstick,
  Droplets,
  Eye,
  Fish,
  Flag,
  Footprints,
  HandHeart,
  HardHat,
  HelpCircle,
  Home,
  LightbulbOff,
  MapPin,
  MessageCircle,
  Moon,
  MoonStar,
  Music,
  Package,
  PartyPopper,
  PiggyBank,
  Save,
  SendToBack,
  ShieldAlert,
  Shirt,
  // Icône référencée par l'action `acheterProvisions` (data.ts) — absente de la
  // liste nominative du spec T-014, ajoutée pour couvrir 100 % des données.
  ShoppingBasket,
  ShowerHead,
  Sparkles,
  Store,
  Sun,
  SunMedium,
  Sunset,
  Swords,
  TrafficCone,
  UserRound,
  Users,
  Volleyball,
  Wrench,
  UtensilsCrossed,
};

export interface GameIconProps {
  /** Nom d'icône tel que porté par les données du jeu (ex. `z.icon`). */
  name: string;
  size?: number;
  className?: string;
}

/**
 * Icône résolue depuis une string de données, fallback `Circle`.
 * Toujours `aria-hidden` : décorative, le libellé voisin porte le sens.
 */
export function GameIcon({ name, size = 16, className }: GameIconProps) {
  const Icon = ICONS[name] ?? Circle;
  return createElement(Icon, { size, className, "aria-hidden": true });
}
