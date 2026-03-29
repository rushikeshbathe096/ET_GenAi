export interface SectorData {
  sector: string;
  change: number;
}

export const mockMarket: SectorData[] = [
  { sector: "IT Services", change: 2.1 },
  { sector: "Banking", change: 1.8 },
  { sector: "Energy", change: -0.4 },
  { sector: "Consumer", change: 1.2 },
  { sector: "Pharma", change: 0.5 },
  { sector: "Auto", change: 2.4 },
];
