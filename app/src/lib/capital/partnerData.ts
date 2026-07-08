import type { Season } from "./data";

export interface JobRequest {
  id: string;
  address: string;
  service: string;
  distanceMi: number;
  price: number;
  scope: string;
}

export interface RouteJob {
  id: string;
  address: string;
  service: string;
  time: string;
  status: "scheduled" | "in progress" | "done";
  price: number;
}

export const INCOMING: Record<Season, JobRequest[]> = {
  summer: [
    { id: "s1", address: "41 Birchwood Lane", service: "Lawn mowing", distanceMi: 1.2, price: 65, scope: "Medium yard" },
    { id: "s2", address: "18 Court Street", service: "Hedge trimming", distanceMi: 2.4, price: 88, scope: "Large yard" },
    { id: "s3", address: "7 Meadow Drive", service: "Edging and cleanup", distanceMi: 0.8, price: 55, scope: "Small yard" },
  ],
  winter: [
    { id: "w1", address: "41 Birchwood Lane", service: "Driveway clearing", distanceMi: 1.2, price: 70, scope: "Medium driveway" },
    { id: "w2", address: "230 Lakeview Road", service: "Snow blowing", distanceMi: 3.1, price: 81, scope: "Large driveway" },
    { id: "w3", address: "12 Orchard Court", service: "Walkway and salt", distanceMi: 1.6, price: 51, scope: "Small walkway" },
  ],
};

export const TODAYS_ROUTE: Record<Season, RouteJob[]> = {
  summer: [
    { id: "sr1", address: "95 Elm Street", service: "Lawn mowing", time: "9:00 AM", status: "done", price: 48 },
    { id: "sr2", address: "12 Hillcrest Avenue", service: "Hedge trimming", time: "11:30 AM", status: "in progress", price: 65 },
  ],
  winter: [
    { id: "wr1", address: "95 Elm Street", service: "Driveway clearing", time: "6:30 AM", status: "done", price: 52 },
    { id: "wr2", address: "12 Hillcrest Avenue", service: "Snow blowing", time: "8:15 AM", status: "in progress", price: 60 },
  ],
};

export interface Earnings {
  week: number;
  afterFee: number;
  days: { label: string; amount: number }[];
}

export const EARNINGS: Record<Season, Earnings> = {
  summer: {
    week: 1284,
    afterFee: 1156,
    days: [
      { label: "Mon", amount: 210 },
      { label: "Tue", amount: 305 },
      { label: "Wed", amount: 188 },
      { label: "Thu", amount: 342 },
      { label: "Fri", amount: 239 },
    ],
  },
  winter: {
    week: 1730,
    afterFee: 1557,
    days: [
      { label: "Mon", amount: 412 },
      { label: "Tue", amount: 285 },
      { label: "Wed", amount: 496 },
      { label: "Thu", amount: 224 },
      { label: "Fri", amount: 313 },
    ],
  },
};
