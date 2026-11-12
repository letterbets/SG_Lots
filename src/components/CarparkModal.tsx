import React, { useState } from 'react';
import { X, Navigation, Copy, Check, Zap, ShieldAlert, Clock, Sun, Bookmark, Calculator, MapPin } from 'lucide-react';
import { Carpark, VehicleType } from '../types/carpark';

interface CarparkModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenCalculator: (carpark: Carpark) => void;
}

export const CarparkModal: React.FC<CarparkModalProps> = ({
  carpark,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenCalculator,
}) => {
  const [copied, setCopied] = useState(false);

  if (!carpark) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${carpark.name}, ${carpark.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { lat, lng } = carpark.coordinates;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const wazeUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-5 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 flex-wrap">
              <span className="font-bold text-emerald-400 uppercase tracking-wider">{carpark.id}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="capitalize">{carpark.region} District</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="capitalize">{carpark.category.toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{carpark.name}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Saved to favorites' : 'Save to favorites'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Real-time Vacancy Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Real-Time Lot Availability
              </span>
              <span className="text-xs text-emerald-400 font-mono">{carpark.lastUpdated}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Car Lots */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <span className="text-xs text-slate-400 block font-medium">Cars (EPS)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {carpark.lots.car.available}
                  </span>
                  <span className="text-xs text-slate-400">/ {carpark.lots.car.total}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${(carpark.lots.car.available / carpark.lots.car.total) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Motorcycles */}
              {carpark.lots.motorcycle && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-xs text-slate-400 block font-medium">Motorcycles</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-teal-400">
                      {carpark.lots.motorcycle.available}
                    </span>
                    <span className="text-xs text-slate-400">/ {carpark.lots.motorcycle.total}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-teal-500 h-full rounded-full"
                      style={{
                        width: `${(carpark.lots.motorcycle.available / carpark.lots.motorcycle.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Heavy Vehicles */}
              {carpark.lots.heavy && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-xs text-slate-400 block font-medium">Heavy Vehicles</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {carpark.lots.heavy.available}
                    </span>
                    <span className="text-xs text-slate-400">/ {carpark.lots.heavy.total}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{
                        width: `${(carpark.lots.heavy.available / carpark.lots.heavy.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address & Navigation Links */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">{carpark.address}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Postal Code: {carpark.postalCode} · GPS: {carpark.coordinates.lat}, {carpark.coordinates.lng}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyAddress}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </a>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-cyan-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Waze</span>
              </a>
              <a
                href={appleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Apple Maps</span>
              </a>
            </div>
          </div>

          {/* Full Rate Structure */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Parking Fee Schedule (EPS)
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onOpenCalculator(carpark);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculate Your Exact Fee</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Weekday Day:</span>
                <span className="font-semibold text-slate-100 text-right">{carpark.rates.weekdayDay}</span>
              </div>
              <div className="flex items-start justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Weekday Evening / Night:</span>
                <span className="font-semibold text-slate-100 text-right">{carpark.rates.weekdayNight}</span>
              </div>
              <div className="flex items-start justify-between py-1.5 border-b border-slate-850">
                <span className="text-slate-400">Saturday:</span>
                <span className="font-semibold text-slate-100 text-right">{carpark.rates.saturday}</span>
              </div>
              <div className="flex items-start justify-between py-1.5">
                <span className="text-slate-400">Sunday &amp; Public Holidays:</span>
                <span className="font-semibold text-amber-300 text-right">{carpark.rates.sundayPH}</span>
              </div>
            </div>
          </div>

          {/* Specifications & Amenities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* EV Charging */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">EV Charging</h4>
              </div>
              {carpark.evCharging.available ? (
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="text-cyan-300 font-medium">
                    {carpark.evCharging.totalChargers} Charging Bays Active
                  </div>
                  <div>Operator: {carpark.evCharging.operator}</div>
                  <div className="text-slate-400">{carpark.evCharging.speed}</div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No public EV charging stations registered.</p>
              )}
            </div>

            {/* Clearance & Grace Period */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Gantry &amp; Access</h4>
              </div>
              <div className="text-xs space-y-1 text-slate-300">
                <div>
                  Clearance Height:{' '}
                  <strong className="text-white">
                    {carpark.clearanceHeightMeters ? `${carpark.clearanceHeightMeters}m` : 'Standard clearance'}
                  </strong>
                </div>
                <div>
                  Drop-off Grace Period:{' '}
                  <strong className="text-emerald-400">{carpark.rates.gracePeriodMinutes} minutes free</strong>
                </div>
                <div className="text-slate-400">Gantry: In-Vehicle Unit (IU) Electronic Parking System (EPS)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Data integrated with Singapore Land Transport standards.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
