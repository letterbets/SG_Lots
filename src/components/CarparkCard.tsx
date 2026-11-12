import React from 'react';
import { Bookmark, Navigation, Calculator, Zap, Clock, ShieldAlert, Sun, Info } from 'lucide-react';
import { Carpark, VehicleType } from '../types/carpark';

interface CarparkCardProps {
  carpark: Carpark;
  vehicleType: VehicleType;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onOpenCalculator: (carpark: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  vehicleType,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onOpenCalculator,
}) => {
  // Determine lots for selected vehicle type
  const getLots = () => {
    if (vehicleType === 'motorcycle') {
      return carpark.lots.motorcycle || { total: 0, available: 0 };
    }
    if (vehicleType === 'heavy') {
      return carpark.lots.heavy || { total: 0, available: 0 };
    }
    return carpark.lots.car;
  };

  const currentLots = getLots();
  const vacancyRate =
    currentLots.total > 0
      ? Math.round((currentLots.available / currentLots.total) * 100)
      : 0;

  // Status visual mapping
  let statusColor = 'text-emerald-400';
  let barColor = 'bg-emerald-500';
  let statusText = 'Plenty of Lots';

  if (currentLots.available === 0) {
    statusColor = 'text-rose-400';
    barColor = 'bg-rose-500';
    statusText = 'Carpark Full';
  } else if (vacancyRate < 10 || currentLots.available < 15) {
    statusColor = 'text-rose-400';
    barColor = 'bg-rose-500';
    statusText = 'Almost Full';
  } else if (vacancyRate < 25 || currentLots.available < 45) {
    statusColor = 'text-amber-400';
    barColor = 'bg-amber-500';
    statusText = 'Filling Fast';
  }

  const formatStructure = (s: string) => {
    switch (s) {
      case 'multi_storey':
        return 'Multi-Storey MSCP';
      case 'basement':
        return 'Basement Carpark';
      case 'surface':
        return 'Surface Open Air';
      case 'mechanized':
        return 'Mechanized Parking';
      default:
        return s;
    }
  };

  const formatCategory = (c: string) => {
    switch (c) {
      case 'hdb':
        return 'HDB Estate';
      case 'mall':
        return 'Shopping Mall';
      case 'office':
        return 'Office / CBD';
      case 'ura':
        return 'URA Public';
      case 'hospital':
        return 'Healthcare / Hospital';
      default:
        return c;
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = carpark.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(
      carpark.name
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onOpenDetails(carpark)}
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Unboxed metadata + Favorite toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Clean unboxed metadata separator */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 flex-wrap">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider">{carpark.id}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{formatCategory(carpark.category)}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{formatStructure(carpark.structure)}</span>
              {carpark.distanceKm !== undefined && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-cyan-400 font-mono font-medium">{carpark.distanceKm} km away</span>
                </>
              )}
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
              {carpark.name}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{carpark.address}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(carpark.id);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              isFavorite
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Real-time Vacancy & Lot Gauge */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-extrabold font-mono tabular-nums ${statusColor}`}>
                  {currentLots.available.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  / {currentLots.total.toLocaleString()} Lots Available
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span className={`font-semibold ${statusColor}`}>{statusText}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{vacancyRate}% Vacant</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Vehicle Type</span>
              <span className="text-xs font-semibold text-slate-200 capitalize">
                {vehicleType === 'car' ? 'Car (EPS)' : vehicleType === 'motorcycle' ? 'Motorcycle' : 'Heavy'}
              </span>
            </div>
          </div>

          {/* Progress Occupancy Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 mt-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full ${barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(100, Math.max(currentLots.total > 0 ? (currentLots.available / currentLots.total) * 100 : 0, 3))}%` }}
            />
          </div>
        </div>

        {/* Rates & Highlights Strip */}
        <div className="mt-3.5 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Day Rate:</span>
            <span className="font-medium text-right truncate max-w-[200px]" title={carpark.rates.weekdayDay}>
              {carpark.rates.weekdayDay}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Night Rate:</span>
            <span className="font-medium text-right truncate max-w-[200px]" title={carpark.rates.weekdayNight}>
              {carpark.rates.weekdayNight}
            </span>
          </div>
        </div>

        {/* Feature Badges Line */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center flex-wrap gap-2 text-[11px] text-slate-400">
          {carpark.evCharging.available && (
            <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>EV Ready ({carpark.evCharging.totalChargers} bays)</span>
            </span>
          )}
          {carpark.freeSundayParking && (
            <span className="flex items-center gap-1 text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Sunday Free</span>
            </span>
          )}
          {carpark.clearanceHeightMeters && (
            <span className="flex items-center gap-1 text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <ShieldAlert className="w-3 h-3 text-indigo-400" />
              <span>{carpark.clearanceHeightMeters}m limit</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{carpark.rates.gracePeriodMinutes}m grace</span>
          </span>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={handleDirections}
          className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          title="Open directions in Google Maps"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>Directions</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCalculator(carpark);
          }}
          className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1"
          title="Calculate parking fee for this carpark"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Fee</span>
        </button>

        <button
          onClick={() => onOpenDetails(carpark)}
          className="py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-300 transition-colors flex items-center justify-center gap-1"
          title="View detailed carpark specs and full rates"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};
