export type VehicleStatus = "Awaiting Collection" | "In Transit" | "Available" | "Reserved" | "Sold" | "Under Repair";
export type Vehicle = {
  id: string;
  stockId: string;
  vin: string;
  engineNumber: string;
  registrationNumber?: string;
  make: string;
  model: string;
  year: number;
  colour: string;
  purchasePrice: number;
  totalCost: number;
  currentLocation: string;
  status: VehicleStatus;
  supplier: string;
  purchaseDate: string;
  createdAt: string;
};