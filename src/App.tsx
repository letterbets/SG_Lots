import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterControls } from './components/FilterControls';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkModal } from './components/CarparkModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { Carpark, FilterState, VehicleType } from './types/carpark';
import { INITIAL_SINGAPORE_CARPARKS } from './data/singaporeCarparks';
import { fetchLiveSingaporeCarparks, calculateDistanceKm } from './services/dataGovSgApi';
import { Bookmark, MapPin, Search, AlertCircle, Sparkles, Navigation, Layers, RefreshCw } from 'lucide-react';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_SINGAPORE_CARPARKS);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_carpark_favorites');
      return saved ? JSON.parse(saved) : ['VIVO', 'SUNTEC', 'JEWEL'];
    } catch {
      return ['VIVO', 'SUNTEC', 'JEWEL'];
    }
  });

  const [activeTab, setActiveTab] = useState<'directory' | 'map' | 'calculator' | 'favorites'>('directory');
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [calculatorTargetCarpark, setCalculatorTargetCarpark] = useState<Carpark | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedTimestamp, setLastSyncedTimestamp] = useState('17:10:00');
  const [sourceLabel, setSourceLabel] = useState('LTA & Data.gov.sg Feed');
  const [isLive, setIsLive] = useState(true);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasUserLocation, setHasUserLocation] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
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
    sortBy: 'availableLots',
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sg_carpark_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sync Live Data
  const syncLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveSingaporeCarparks(carparks);
      // Re-apply distance if user location exists
      const updated = result.carparks.map((c) => {
        if (userLocation) {
          const distance = calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            c.coordinates.lat,
            c.coordinates.lng
          );
          return { ...c, distanceKm: distance };
        }
        return c;
      });

      setCarparks(updated);
      setLastSyncedTimestamp(result.lastSyncedTimestamp);
      setSourceLabel(result.sourceLabel);
      setIsLive(result.isLive);
    } catch (e) {
      console.error('Failed to sync live carpark lots:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [carparks, userLocation]);

  // Initial fetch and auto-refresh every 60s
  useEffect(() => {
    syncLiveData();
    const interval = setInterval(() => {
      syncLiveData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setHasUserLocation(true);
        setIsLocating(false);

        // Update carparks with distance
        setCarparks((prev) =>
          prev.map((c) => ({
            ...c,
            distanceKm: calculateDistanceKm(coords.lat, coords.lng, c.coordinates.lat, c.coordinates.lng),
          }))
        );

        // Automatically set sort to distance
        setFilters((f) => ({ ...f, sortBy: 'distance' }));
      },
      (error) => {
        console.warn('Geolocation error or denied:', error);
        setIsLocating(false);
        // Default to City Hall Central Singapore
        const defaultCenter = { lat: 1.293, lng: 103.852 };
        setUserLocation(defaultCenter);
        setHasUserLocation(true);
        setCarparks((prev) =>
          prev.map((c) => ({
            ...c,
            distanceKm: calculateDistanceKm(defaultCenter.lat, defaultCenter.lng, c.coordinates.lat, c.coordinates.lng),
          }))
        );
        setFilters((f) => ({ ...f, sortBy: 'distance' }));
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Filtered & Sorted carparks
  const displayedCarparks = useMemo(() => {
    let list = [...carparks];

    // If favorites tab active, only show favorites
    if (activeTab === 'favorites') {
      list = list.filter((c) => favorites.includes(c.id));
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.postalCode.includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    // Region
    if (filters.region !== 'all') {
      list = list.filter((c) => c.region === filters.region);
    }

    // Category
    if (filters.category !== 'all') {
      list = list.filter((c) => c.category === filters.category);
    }

    // EV Charging
    if (filters.evChargingOnly) {
      list = list.filter((c) => c.evCharging.available);
    }

    // Free Sunday
    if (filters.freeSundayOnly) {
      list = list.filter((c) => c.freeSundayParking);
    }

    // Clearance Height
    if (filters.minClearanceHeight > 0) {
      list = list.filter((c) => (c.clearanceHeightMeters || 2.0) >= filters.minClearanceHeight);
    }

    // Grace Period
    if (filters.gracePeriodOnly) {
      list = list.filter((c) => c.rates.gracePeriodMinutes >= 15);
    }

    // Vehicle Type & Min Lots
    const getLots = (c: Carpark, v: VehicleType) => {
      if (v === 'motorcycle') return c.lots.motorcycle?.available || 0;
      if (v === 'heavy') return c.lots.heavy?.available || 0;
      return c.lots.car.available;
    };

    if (filters.minLotsAvailable > 0) {
      list = list.filter((c) => getLots(c, filters.vehicleType) >= filters.minLotsAvailable);
    }

    // Sorting
    list.sort((a, b) => {
      if (filters.sortBy === 'distance' && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (filters.sortBy === 'availableLots') {
        return getLots(b, filters.vehicleType) - getLots(a, filters.vehicleType);
      }
      if (filters.sortBy === 'vacancyRate') {
        const getRate = (c: Carpark) => {
          const l = filters.vehicleType === 'motorcycle' ? c.lots.motorcycle : c.lots.car;
          return l && l.total > 0 ? l.available / l.total : 0;
        };
        return getRate(b) - getRate(a);
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [carparks, activeTab, favorites, filters]);

  // Handlers for modal interactions
  const handleOpenDetails = (carpark: Carpark) => {
    setSelectedCarpark(carpark);
    setIsDetailsModalOpen(true);
  };

  const handleOpenCalculator = (carpark: Carpark) => {
    setCalculatorTargetCarpark(carpark);
    setIsCalculatorModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        onRefresh={syncLiveData}
        isRefreshing={isRefreshing}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        hasUserLocation={hasUserLocation}
      />

      {/* Real-time stats summary strip */}
      <StatsBar
        carparks={carparks}
        vehicleType={filters.vehicleType}
        lastSyncedTimestamp={lastSyncedTimestamp}
        sourceLabel={sourceLabel}
        isLive={isLive}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner / Tab Headings if viewing Favorites or Calculator */}
        {activeTab === 'favorites' && (
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bookmark className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Saved Carparks</h2>
                <p className="text-xs text-slate-400">
                  Quick access to {favorites.length} bookmarked locations across Singapore
                </p>
              </div>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={() => setFavorites([])}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear all favorites
              </button>
            )}
          </div>
        )}

        {/* Global Filter Bar */}
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          totalResults={displayedCarparks.length}
          hasUserLocation={hasUserLocation}
        />

        {/* Tab 1 & Tab 4: Directory & Favorites List View */}
        {(activeTab === 'directory' || activeTab === 'favorites') && (
          <div>
            {displayedCarparks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedCarparks.map((carpark) => (
                  <CarparkCard
                    key={carpark.id}
                    carpark={carpark}
                    vehicleType={filters.vehicleType}
                    isFavorite={favorites.includes(carpark.id)}
                    onToggleFavorite={toggleFavorite}
                    onOpenDetails={handleOpenDetails}
                    onOpenCalculator={handleOpenCalculator}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No carparks match your filter</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Try adjusting your search query, selecting &quot;All Singapore&quot;, or removing feature filters.
                </p>
                <button
                  onClick={() =>
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
                      sortBy: 'availableLots',
                    })
                  }
                  className="mt-5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Full Interactive Map View */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Interactive Singapore GIS Map · Click any lot pin to inspect or navigate
              </span>
              <span>Showing {displayedCarparks.length} plotted locations</span>
            </div>
            <CarparkMap
              carparks={displayedCarparks}
              vehicleType={filters.vehicleType}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={(c) => {
                setSelectedCarpark(c);
              }}
              userLocation={userLocation}
              onOpenDetails={handleOpenDetails}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Rate Estimator View */}
        {activeTab === 'calculator' && (
          <div className="max-w-2xl mx-auto my-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Singapore EPS Parking Fee Estimator</h2>
                  <p className="text-xs text-slate-400">
                    Compare shopping mall rates, HDB $0.60/30m, Sunday free parking, and grace periods
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                <button
                  onClick={() => {
                    setCalculatorTargetCarpark(carparks[0]);
                    setIsCalculatorModalOpen(true);
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Launch Full Rate Calculator
                </button>
              </div>

              {/* Quick Rate Cheat Sheet for Singapore Drivers */}
              <div className="border-t border-slate-800 pt-5 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Singapore Standard Parking Tariff Guide
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">HDB / URA Standard (Outside Central)</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">$0.60 per 30 minutes (7:00 AM - 10:30 PM)</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">$1.20 / hr</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">HDB / URA Central Area Surcharge</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        $1.20 per 30 mins (7am - 5pm, Mon-Sat in designated Central Zone)
                      </p>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">$2.40 / hr</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">HDB Night Parking Scheme</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        10:30 PM - 7:00 AM capped at maximum $5.00 overnight
                      </p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">Max $5.00</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">Sunday &amp; Public Holiday Free Parking</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Free parking 7:00 AM - 10:30 PM at participating HDB residential lots
                      </p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">FREE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Details Specifications Modal */}
      {isDetailsModalOpen && selectedCarpark && (
        <CarparkModal
          carpark={selectedCarpark}
          onClose={() => setIsDetailsModalOpen(false)}
          isFavorite={favorites.includes(selectedCarpark.id)}
          onToggleFavorite={toggleFavorite}
          onOpenCalculator={(c) => {
            setIsDetailsModalOpen(false);
            setCalculatorTargetCarpark(c);
            setIsCalculatorModalOpen(true);
          }}
        />
      )}

      {/* Fee Calculator Modal */}
      {isCalculatorModalOpen && (
        <FeeCalculatorModal
          initialCarpark={calculatorTargetCarpark}
          allCarparks={carparks}
          onClose={() => setIsCalculatorModalOpen(false)}
          onSelectAlternateCarpark={(c) => setSelectedCarpark(c)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">SG Carpark Live</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Real-time availability for Singapore drivers</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Data: LTA / HDB / URA / Data.gov.sg</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>EPS &amp; IU Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
