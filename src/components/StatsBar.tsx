import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';

interface StatsBarProps {
  carparks: Carpark[];
  vehicleType: VehicleType;
  lastSyncedTimestamp: string;
  sourceLabel: string;
  isLive: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  carparks,
  vehicleType,
  lastSyncedTimestamp,
  sourceLabel,
  isLive,
}) => {
  const getLots = (carpark: Carpark) => {
    if (vehicleType === 'motorcycle') {
      return carpark.lots.motorcycle || { total: 0, available: 0 };
    }
    if (vehicleType === 'heavy') {
      return carpark.lots.heavy || { total: 0, available: 0 };
    }
    return carpark.lots.car;
  };

  const totalCapacity = carparks.reduce((sum, c) => sum + getLots(c).total, 0);
  const totalAvailable = carparks.reduce((sum, c) => sum + getLots(c).available, 0);
  const vacancyPercent = totalCapacity > 0 ? Math.round((totalAvailable / totalCapacity) * 100) : 0;
  const criticalCount = carparks.filter((c) => getLots(c).available < 15).length;
  const evCount = carparks.filter((c) => c.evCharging.available).length;

  return (
    <div className="bg-slate-900/60 border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Real-time sync metadata (unboxed, clean typography) */}
        <div className="flex items-center flex-wrap gap-2 text-slate-400">
          <span className="font-medium text-slate-200 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {sourceLabel}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Synced at <strong className="font-mono tabular-nums text-slate-300">{lastSyncedTimestamp}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Coverage: Central, Orchard, HDB Hubs, East, West, North</span>
        </div>

        {/* High-density tabular figures stats */}
        <div className="flex items-center flex-wrap gap-4 font-medium text-slate-300">
          <div>
            <span className="text-slate-400">Tracked:</span>{' '}
            <span className="font-mono tabular-nums text-white font-semibold">{carparks.length}</span> Locations
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Available:</span>{' '}
            <span className="font-mono tabular-nums text-emerald-400 font-bold">{totalAvailable.toLocaleString()}</span>{' '}
            / <span className="font-mono tabular-nums text-slate-400">{totalCapacity.toLocaleString()}</span> Lots
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Avg Vacancy:</span>{' '}
            <span className="font-mono tabular-nums text-white font-semibold">{vacancyPercent}%</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400">Almost Full (&lt;15):</span>{' '}
            <span className="font-mono tabular-nums text-amber-400 font-semibold">{criticalCount}</span>
          </div>
          <div className="h-3 w-px bg-slate-800 hidden lg:block" />
          <div className="hidden lg:block">
            <span className="text-slate-400">EV Stations:</span>{' '}
            <span className="font-mono tabular-nums text-cyan-400 font-semibold">{evCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
