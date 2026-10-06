import { readFileSync } from "fs";
import {
  RATES,
  UNIT_WEIGHT_KG,
  SOBREFLETE_RATE,
  MIN_DECLARED_VALUE,
  LOCAL_CITIES,
  REGIONAL_DEPARTMENTS,
  HARD_ACCESS_DEPARTMENTS,
  NATIONAL_DEPARTMENT_TIER,
  DEFAULT_NATIONAL_TIER,
  METROPOLITAN_CITIES,
} from "../config/shipping.mjs";

const LOCATIONS = JSON.parse(
  readFileSync(new URL("../config/colombia-locations.json", import.meta.url), "utf8")
);

export const isValidLocation = (department, city) =>
  typeof department === "string" &&
  typeof city === "string" &&
  Object.prototype.hasOwnProperty.call(LOCATIONS, department) &&
  LOCATIONS[department].includes(city);

export const classifyDestination = (department, city) => {
  const key = `${department}|${city}`;
  if (LOCAL_CITIES.has(key)) return { zone: "local", tier: 0 };
  if (department in REGIONAL_DEPARTMENTS) {
    return { zone: "regional", tier: REGIONAL_DEPARTMENTS[department] };
  }
  if (department in HARD_ACCESS_DEPARTMENTS) {
    return { zone: "dificil", tier: HARD_ACCESS_DEPARTMENTS[department] };
  }
  return {
    zone: METROPOLITAN_CITIES.has(key) ? "metropolitano" : "municipal",
    tier: NATIONAL_DEPARTMENT_TIER[department] ?? DEFAULT_NATIONAL_TIER,
  };
};

const minDeclaredValue = (kg) => MIN_DECLARED_VALUE.find(([maxKg]) => kg <= maxKg)[1];

export const calculateShipping = ({ department, city, units, declaredValue }) => {
  if (!isValidLocation(department, city)) {
    throw new Error("Invalid destination");
  }
  const kg = Math.max(1, Math.ceil(units * UNIT_WEIGHT_KG));
  const { zone, tier } = classifyDestination(department, city);
  const rate = RATES[zone];

  const base = rate.base;
  const additional = (kg - 1) * rate.extra[Math.min(tier, rate.extra.length - 1)];
  const sobreflete = Math.round(
    SOBREFLETE_RATE * Math.max(declaredValue || 0, minDeclaredValue(kg))
  );

  return {
    cost: base + additional + sobreflete,
    zone,
    weightKg: kg,
    breakdown: { base, additional, sobreflete },
  };
};
