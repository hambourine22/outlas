import type { Repairs } from "@/app/definitions/mapboxDefinitions";

function repair(overrides: Partial<Repairs>): Repairs {
  return {
    name: "",
    repair_address: "",
    repair_phone: "",
    repair_website: "",
    regions: "Scotland",
    accept_in_person_visits: "yes",
    image_url: "",
    opening_times: "",
    item_id: "",
    slug: "",
    status: "published",
    lat: 0,
    long: 0,
    ...overrides,
  };
}

export const REPAIRS: Repairs[] = [
  repair({
    name: "Aviemore Edge Works",
    slug: "aviemore-edge-works",
    item_id: "p-aviemore-edge",
    repair_address: "Grampian Road, Aviemore PH22 1PD",
    repair_phone: "+44 1479 810222",
    repair_website: "https://edgeworks.example",
    opening_times: "Daily, 09:00 – 18:00",
    lat: 57.1894,
    long: -3.8278,
  }),
  repair({
    name: "Fort William Base Grinder",
    slug: "fort-william-base-grinder",
    item_id: "p-fort-william",
    repair_address: "High Street, Fort William PH33 6DJ",
    repair_phone: "+44 1397 702022",
    opening_times: "Tue – Sat, 09:30 – 17:00",
    lat: 56.8198,
    long: -5.1052,
  }),
  repair({
    name: "Perthshire Ski Service",
    slug: "perthshire-ski-service",
    item_id: "p-perth",
    repair_address: "Scott Street, Perth PH1 5EH",
    repair_phone: "+44 1738 622022",
    opening_times: "Mon – Sat, 10:00 – 17:30",
    lat: 56.3978,
    long: -3.4370,
  }),
];
