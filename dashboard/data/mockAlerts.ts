export interface Alert {
  id: string;
  type: "MOVEMENT" | "UPGRADE" | "CIRCUIT";
  message: string;
  timestamp: string;
  read: boolean;
}

export const mockAlerts: Alert[] = [
  { id: "1", type: "MOVEMENT", message: "Reliance dropped 4.7 percent", timestamp: "10:30 AM", read: false },
  { id: "2", type: "UPGRADE", message: "Titan upgraded to STRONG BUY", timestamp: "09:45 AM", read: false },
  { id: "3", type: "CIRCUIT", message: "SBIN hit Upper Circuit", timestamp: "11:15 AM", read: true },
];
