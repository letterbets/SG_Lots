import React from 'react';
import { Search, X, Zap, Sun, ShieldAlert, Clock, ArrowUpDown } from 'lucide-react';
import { FilterState, SingaporeRegion, CarparkCategory, VehicleType } from '../types/carpark';

interface FilterControlsProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
  hasUserLocation: boolean;
}

const REGIONS: Array<{ id: 'all' | SingaporeRegion; label: string }> = [
  { id: 'all', label: 'All Singapore' },
  { id: 'central', label: 'Central / CBD' },
  { id: 'orchard', label: 'Orchard' },
  { id: 'marinabay', label: 'Marina Bay' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'north', label: 'North' },
  { id: 'northeast', label: 'North-East' },
];

const CATEGORIES: Array<{ id: 'all' | CarparkCategory; label: string }> = [
  { id: 'all', label: 'All Operators' },
  { id: 'mall', label: 'Shopping Malls' },
  { id: 'hdb', label: 'HDB MSCP / Estates' },
  { id: 'office', label: 'CBD & Office Towers' },
  { id: 'ura', label: 'URA Public Lots' },
  { id: 'hospital', label: 'Hospitals' },
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  setFilters,
  totalResults,
  hasUserLocation,
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.region !== 'all' ||
    filters.category !== 'all' ||
    filters.minLotsAvailable > 0 ||
    filters.evChargingOnly ||
    filters.freeSundayOnly ||
    filters.minClearanceHeight > 0 ||
    filters.gracePeriodOnly;

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      region: 'all',
      category: 'all',
      structure: 'all',
      vehicleType: 'car',
      minLotsAvailable: 0,
      evChargingOnly: false,
      freeSundayOnly: false,
      minClearanceHeight: 0,
      gracePeriodOnly: false,
      sortBy: hasUserLocation ? 'distance' : 'availableLots',
    });
  };

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Row 1: Search + Vehicle Selector + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by carpark name, street, postal code (e.g. Vivo, Tampines, 038983)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vehicle Segmented Control */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, vehicleType: 'car' }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filters.vehicleType === 'car'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cars
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, vehicleType: 'motorcycle' }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filters.vehicleType === 'motorcycle'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Motorcycles
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, vehicleType: 'heavy' }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filters.vehicleType === 'heavy'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Heavy Vehicles
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                aria-label="Sort carparks by"
                className="appearance-none pl-8 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
              >
                {hasUserLocation && <option value="distance">Closest Distance</option>}
                <option value="availableLots">Most Available Lots</option>
                <option value="vacancyRate">Highest Vacancy %</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Region Filter Bar (Clean Segmented Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Region:</span>
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setFilters((prev) => ({ ...prev, region: region.id }))}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filters.region === region.id
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-sm'
                  : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>

        {/* Row 3: Operator Categories & Specific Functional Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
          {/* Operator Types */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 font-medium mr-1 shrink-0">Operator:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  filters.category === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-slate-950 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Smart Feature Toggles */}
          <div className="flex items-center flex-wrap gap-2">
            {/* EV Charging */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, evChargingOnly: !prev.evChargingOnly }))}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                filters.evChargingOnly
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>EV Charging</span>
            </button>

            {/* Sunday Free Parking */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, freeSundayOnly: !prev.freeSundayOnly }))}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                filters.freeSundayOnly
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Sunday Free HDB</span>
            </button>

            {/* Min Clearance Height (>= 2.0m for SUVs / Vans) */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  minClearanceHeight: prev.minClearanceHeight === 2.0 ? 0 : 2.0,
                }))
              }
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                filters.minClearanceHeight >= 2.0
                  ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-indigo-400" />
              <span>Height &ge; 2.0m</span>
            </button>

            {/* Grace Period >= 15 min */}
            <button
              onClick={() => setFilters((prev) => ({ ...prev, gracePeriodOnly: !prev.gracePeriodOnly }))}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                filters.gracePeriodOnly
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Grace &ge; 15 min</span>
            </button>

            <span className="text-slate-500 font-mono text-xs ml-2">
              Showing <strong className="text-slate-200">{totalResults}</strong> carparks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
