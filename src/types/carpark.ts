export type VehicleType = 'car' | 'motorcycle' | 'heavy';

export type CarparkCategory = 'hdb' | 'mall' | 'ura' | 'office' | 'hospital';

export type CarparkStructure = 'multi_storey' | 'basement' | 'surface' | 'mechanized';

export type SingaporeRegion = 'central' | 'orchard' | 'marinabay' | 'east' | 'west' | 'north' | 'northeast';

export interface VehicleLots {
  total: number;
  available: number;
}

export interface CarparkRates {
  weekdayDay: string; // e.g. "$0.60 per 30 mins"
  weekdayNight: string; // e.g. "$5.00 per entry (10.30pm - 7am)"
  saturday: string;
  sundayPH: string; // e.g. "Free parking 7am - 10.30pm"
  gracePeriodMinutes: number; // e.g. 10 or 15
  isCentralZone?: boolean;
  baseHalfHourlyRate?: number; // In SGD e.g. 0.60 or 1.20
  firstHourRate?: number;
  subsequentHalfHourRate?: number;
  perEntryEveningRate?: number;
  eveningEntryStartTime?: string; // "18:00"
}

export interface EVChargingInfo {
  available: boolean;
  totalChargers?: number;
  operator?: string; // e.g. "SP Mobility", "Charge+", "Tesla Supercharger"
  speed?: string; // e.g. "22kW AC / 50kW DC"
}

export interface Carpark {
  id: string; // Official Code e.g. "ACB", "VIVO", "ION", "SUNTEC"
  name: string;
  address: string;
  postalCode: string;
  region: SingaporeRegion;
  category: CarparkCategory;
  structure: CarparkStructure;
  coordinates: {
    lat: number;
    lng: number;
  };
  clearanceHeightMeters?: number; // e.g. 2.15, 1.90
  freeSundayParking: boolean;
  evCharging: EVChargingInfo;
  rates: CarparkRates;
  lots: {
    car: VehicleLots;
    motorcycle?: VehicleLots;
    heavy?: VehicleLots;
  };
  lastUpdated: string; // ISO string or relative time
  isRealtimeLive: boolean;
  distanceKm?: number; // Calculated dynamically from user location
}

export interface FilterState {
  searchQuery: string;
  region: 'all' | SingaporeRegion;
  category: 'all' | CarparkCategory;
  structure: 'all' | CarparkStructure;
  vehicleType: VehicleType;
  minLotsAvailable: number; // 0, 10, 30, 50, 100
  evChargingOnly: boolean;
  freeSundayOnly: boolean;
  minClearanceHeight: number; // 0, 1.9, 2.0, 2.1
  gracePeriodOnly: boolean; // >= 15 mins
  sortBy: 'distance' | 'availableLots' | 'vacancyRate' | 'name';
}
