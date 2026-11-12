import { Carpark } from '../types/carpark';

export interface FeeCalculationInput {
  dayType: 'weekday' | 'saturday' | 'sunday';
  entryTime: string; // 'HH:mm' 24-hr format, e.g. "14:30"
  durationMinutes: number; // e.g. 120 (2 hours)
}

export interface FeeCalculationResult {
  estimatedCost: number;
  breakdown: string;
  isFree: boolean;
  appliedGracePeriod: boolean;
  savingsNote?: string;
}

/**
 * Calculates estimated parking fee in SGD for a given Singapore carpark and parking duration.
 */
export function calculateParkingFee(
  carpark: Carpark,
  input: FeeCalculationInput
): FeeCalculationResult {
  const { dayType, entryTime, durationMinutes } = input;
  const rates = carpark.rates;

  // 1. Check Grace Period
  if (durationMinutes <= rates.gracePeriodMinutes) {
    return {
      estimatedCost: 0,
      breakdown: `Free under ${rates.gracePeriodMinutes}-minute gantry grace period`,
      isFree: true,
      appliedGracePeriod: true,
    };
  }

  // 2. Check Sunday Free Parking for HDB
  if (dayType === 'sunday' && carpark.freeSundayParking) {
    const [entryHour] = entryTime.split(':').map(Number);
    // HDB Sunday free parking runs 7:00 AM to 10:30 PM
    if (entryHour >= 7 && entryHour < 22) {
      return {
        estimatedCost: 0,
        breakdown: 'FREE Parking Scheme (Sunday / Public Holiday 7:00 AM - 10:30 PM)',
        isFree: true,
        appliedGracePeriod: false,
        savingsNote: `Saved ~$${((durationMinutes / 30) * (rates.baseHalfHourlyRate || 0.6)).toFixed(2)} under HDB Sunday scheme`,
      };
    }
  }

  const [entryH, entryM] = entryTime.split(':').map(Number);
  const entryMinutesOfDay = entryH * 60 + entryM;

  // Check Evening Flat Per-Entry Rate (if applicable)
  if (rates.perEntryEveningRate && rates.eveningEntryStartTime) {
    const [evH, evM] = rates.eveningEntryStartTime.split(':').map(Number);
    const eveningThreshold = evH * 60 + evM;
    if (entryMinutesOfDay >= eveningThreshold) {
      return {
        estimatedCost: rates.perEntryEveningRate,
        breakdown: `Flat evening per-entry rate after ${rates.eveningEntryStartTime}`,
        isFree: false,
        appliedGracePeriod: false,
      };
    }
  }

  // Standard Duration Calculation
  // First hour vs subsequent blocks
  let totalFee = 0;
  let breakdown = '';

  const firstHourRate = rates.firstHourRate ?? (rates.baseHalfHourlyRate ? rates.baseHalfHourlyRate * 2 : 1.2);
  const subsequentHalfHourRate = rates.subsequentHalfHourRate ?? (rates.baseHalfHourlyRate ?? 0.6);

  if (durationMinutes <= 60) {
    totalFee = firstHourRate;
    breakdown = `1st hour rate: $${firstHourRate.toFixed(2)}`;
  } else {
    const remainingMinutes = durationMinutes - 60;
    const additionalHalfHours = Math.ceil(remainingMinutes / 30);
    const additionalCost = additionalHalfHours * subsequentHalfHourRate;
    totalFee = firstHourRate + additionalCost;
    breakdown = `1st hour ($${firstHourRate.toFixed(2)}) + ${additionalHalfHours} × 30-min ($${subsequentHalfHourRate.toFixed(2)})`;
  }

  // Cap for HDB overnight parking if applies ($5.00 cap)
  if (carpark.category === 'hdb' && totalFee > 12.0) {
    totalFee = 12.0; // Daily cap
    breakdown += ' (Capped at maximum daily fee)';
  }

  return {
    estimatedCost: Math.round(totalFee * 100) / 100,
    breakdown,
    isFree: totalFee === 0,
    appliedGracePeriod: false,
  };
}
