/**
 * Identifiant d'appareil anonyme et persistant pour le cloud save.
 * Acteur : shared. Généré une seule fois, stocké en localStorage.
 */

import { v4 as uuidv4 } from "uuid";

const KEY = "abidjan-hustle-device";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
