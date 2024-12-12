export type Event = {
  type: string;
  params: any[]; // Adjust as needed, replace `any` with specific parameter types if known
  start: string; // ISO date string
  end: string; // ISO date string
  dtstamp: string; // ISO date string
  organizer: {
    params: {
      CN: string;
    };
    val: string; // Email or URL for the organizer
  };
  uid: string; // Unique identifier for the event
  summary: string; // Brief title of the event
  description: string; // Detailed description of the event
  location: string; // Address or location details
  geo: {
    lat: number; // Latitude
    lon: number; // Longitude
  };
  sequence: string; // Sequence number or version for the event
  status: "TENTATIVE" | "CONFIRMED" | "CANCELLED"; // Possible state of the event
};
