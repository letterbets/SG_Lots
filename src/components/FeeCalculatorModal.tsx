import React, { useState, useMemo } from 'react';
import { X, Calculator, Clock, Calendar, CheckCircle, Sparkles, Navigation } from 'lucide-react';
import { Carpark } from '../types/carpark';
import { calculateParkingFee } from '../utils/feeCalculator';

interface FeeCalculatorModalProps {
  initialCarpark: Carpark | null;
  allCarparks: Carpark[];
  onClose: () => void;
  onSelectAlternateCarpark: (carpark: Carpark) => void;
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  initialCarpark,
  allCarparks,
  onClose,
  onSelectAlternateCarpark,
}) => {
  const [selectedCarparkId, setSelectedCarparkId] = useState<string>(
    initialCarpark ? initialCarpark.id : allCarparks[0]?.id || ''
  );
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [entryTime, setEntryTime] = useState<string>('14:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // 2 hours default

  const currentCarpark = useMemo(() => {
    return allCarparks.find((c) => c.id === selectedCarparkId) || allCarparks[0];
  }, [allCarparks, selectedCarparkId]);

  const calculation = useMemo(() => {
    if (!currentCarpark) return null;
    return calculateParkingFee(currentCarpark, {
      dayType,
      entryTime,
      durationMinutes,
    });
  }, [currentCarpark, dayType, entryTime, durationMinutes]);

  // Comparison with alternatives in the same region
  const nearbyAlternatives = useMemo(() => {
    if (!currentCarpark) return [];
    return allCarparks
      .filter((c) => c.id !== currentCarpark.id && c.region === currentCarpark.region)
      .slice(0, 3)
      .map((alt) => ({
        carpark: alt,
        result: calculateParkingFee(alt, { dayType, entryTime, durationMinutes }),
      }));
  }, [allCarparks, currentCarpark, dayType, entryTime, durationMinutes]);

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours === 0) return `${m} mins`;
    if (m === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours} hr ${m} mins`;
  };

  if (!currentCarpark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Singapore Parking Fee Estimator</h2>
              <p className="text-xs text-slate-400">Calculate EPS parking charges based on time and duration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Carpark Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Carpark
            </label>
            <select
              value={selectedCarparkId}
              onChange={(e) => setSelectedCarparkId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              {allCarparks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) - {c.category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Day Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Day of Parking
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDayType('weekday')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                  dayType === 'weekday'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekday (Mon - Fri)
              </button>
              <button
                type="button"
                onClick={() => setDayType('saturday')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                  dayType === 'saturday'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Saturday
              </button>
              <button
                type="button"
                onClick={() => setDayType('sunday')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                  dayType === 'sunday'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Sunday &amp; Public Holiday
              </button>
            </div>
          </div>

          {/* Time & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Entry Time (24-Hour)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Parking Duration
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatDuration(durationMinutes)}
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={480}
                step={15}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2.5"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>15 min</span>
                <span>2 hrs</span>
                <span>4 hrs</span>
                <span>8 hrs</span>
              </div>
            </div>
          </div>

          {/* Calculation Result Showcase Box */}
          {calculation && (
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-inner">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Estimated Parking Charge
              </span>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold font-mono text-emerald-400">
                  ${calculation.estimatedCost.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-mono">SGD</span>
                {calculation.isFree && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/40 rounded-full">
                    FREE
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{calculation.breakdown}</span>
              </p>

              {calculation.savingsNote && (
                <div className="mt-3 p-2.5 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{calculation.savingsNote}</span>
                </div>
              )}
            </div>
          )}

          {/* Regional Rate Comparison Strip */}
          {nearbyAlternatives.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Compare Nearby Alternatives ({currentCarpark.region.toUpperCase()})
              </span>
              <div className="space-y-1.5">
                {nearbyAlternatives.map(({ carpark: alt, result }) => (
                  <div
                    key={alt.id}
                    onClick={() => {
                      setSelectedCarparkId(alt.id);
                      onSelectAlternateCarpark(alt);
                    }}
                    className="flex items-center justify-between p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 hover:text-emerald-400 truncate max-w-[240px]">
                        {alt.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {alt.category.toUpperCase()} · {alt.lots.car.available} lots free
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-white">${result.estimatedCost.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">for {formatDuration(durationMinutes)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Based on published EPS gantry tariffs</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
