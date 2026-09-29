import React, { useState } from 'react';
import {
  SAMPLE_FLIGHTS,
  SAMPLE_HOTELS,
  SAMPLE_CABS,
  SAMPLE_RESTAURANTS,
  SAMPLE_PLACES,
  FlightItem,
  HotelItem,
  CabOption,
  RestaurantItem,
  TouristPlaceItem,
} from '../data/travelData';
import {
  Plane,
  Building2,
  Car,
  Utensils,
  MapPin,
  Search,
  Check,
  Plus,
} from 'lucide-react';

// Resilient Image Component following Zero-Broken-Image Policy
export const ResilientImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}> = ({ src, alt, className = '', fallbackLabel }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 via-slate-800 to-slate-900 text-white p-4 text-center ${className}`}
      >
        <MapPin className="w-6 h-6 text-teal-300 mb-1.5" />
        <span className="text-xs font-medium text-slate-200 line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

// ============================================================================
// 1. FLIGHT SEARCH COMPONENT
// ============================================================================
export const FlightSearchSection: React.FC<{
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  selectedFlight: FlightItem;
  onSelectFlight: (f: FlightItem) => void;
  darkMode: boolean;
}> = ({
  origin,
  destination,
  startDate,
  endDate,
  travellers,
  selectedFlight,
  onSelectFlight,
  darkMode,
}) => {
  const [fromInput, setFromInput] = useState(origin);
  const [toInput, setToInput] = useState(destination);
  const [depDate, setDepDate] = useState(startDate);
  const [retDate, setRetDate] = useState(endDate);
  const [pax, setPax] = useState(travellers);
  const [cabinFilter, setCabinFilter] = useState<'All' | 'Economy' | 'Business'>('All');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'earliest'>('price');
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState('All');
  const [depTimeSlot, setDepTimeSlot] = useState<'All' | 'Morning' | 'Afternoon'>('All');
  const [inspectFlight, setInspectFlight] = useState<FlightItem | null>(null);

  const airlines = ['All', 'IndiGo', 'Air India Express', 'Akasa Air', 'Air India'];

  const filteredFlights = SAMPLE_FLIGHTS.filter((f) => {
    if (cabinFilter !== 'All' && f.cabinClass !== cabinFilter) return false;
    if (nonStopOnly && f.stops > 0) return false;
    if (airlineFilter !== 'All' && f.airline !== airlineFilter) return false;
    if (depTimeSlot === 'Morning' && f.departureHour >= 12) return false;
    if (depTimeSlot === 'Afternoon' && f.departureHour < 12) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    return a.departureHour - b.departureHour;
  });

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            SAMPLE / DEMO SCHEDULE & ESTIMATED FARES · Not Live Airline Inventory
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Plane className="w-6 h-6 text-teal-600" />
            <span>Flight Search & Schedules</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compare flights for {fromInput} → {toInput}, filter by non-stop, cabin class, airline, or departure window, and add to your trip budget.
          </p>
        </div>
      </div>

      {/* Search & Filter Control Grid */}
      <div className={`p-5 rounded-xl border ${cardSurface} space-y-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="text"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="text"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Departure Date</label>
            <input
              type="date"
              value={depDate}
              onChange={(e) => setDepDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Return Date</label>
            <input
              type="date"
              value={retDate}
              onChange={(e) => setRetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Passengers</label>
            <input
              type="number"
              min={1}
              max={20}
              value={pax}
              onChange={(e) => setPax(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Cabin Class</label>
            <select
              value={cabinFilter}
              onChange={(e) => setCabinFilter(e.target.value as 'All' | 'Economy' | 'Business')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="All">All Classes</option>
              <option value="Economy">Economy Class</option>
              <option value="Business">Business Class</option>
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Sort by:</span>
            {(
              [
                { id: 'price', label: 'Lowest Price' },
                { id: 'duration', label: 'Shortest Duration' },
                { id: 'earliest', label: 'Earliest Departure' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSortBy(s.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                  sortBy === s.id
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
                }`}
              >
                {s.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setNonStopOnly((v) => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                nonStopOnly
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              Non-stop Only
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={airlineFilter}
              onChange={(e) => setAirlineFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {airlines.map((a) => (
                <option key={a} value={a}>
                  Airline: {a}
                </option>
              ))}
            </select>

            <select
              value={depTimeSlot}
              onChange={(e) => setDepTimeSlot(e.target.value as 'All' | 'Morning' | 'Afternoon')}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="All">Departure: Any Time</option>
              <option value="Morning">Morning (Before 12 PM)</option>
              <option value="Afternoon">Afternoon (12 PM – 6 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Results List */}
      <div className="space-y-3">
        {filteredFlights.map((flight) => {
          const isChosen = selectedFlight.id === flight.id;
          return (
            <div
              key={flight.id}
              className={`p-5 rounded-xl border transition-colors ${cardSurface} ${
                isChosen ? 'ring-2 ring-teal-600' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {flight.airline}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{flight.flightNumber}</span>
                    <span>·</span>
                    <span>{flight.cabinClass}</span>
                    <span>·</span>
                    <span className="text-amber-700 dark:text-amber-400">
                      {flight.seatsEstimated}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 pt-1">
                    <div>
                      <p className="text-xl font-semibold font-mono tabular-nums">
                        {flight.departureTime}
                      </p>
                      <p className="text-xs text-slate-500">{fromInput}</p>
                    </div>
                    <div className="text-center px-3">
                      <p className="text-xs font-mono tabular-nums text-slate-500">
                        {flight.durationLabel}
                      </p>
                      <div className="w-24 h-px bg-slate-300 dark:bg-slate-700 my-1" />
                      <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                        {flight.stopsLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold font-mono tabular-nums">
                        {flight.arrivalTime}
                      </p>
                      <p className="text-xs text-slate-500">{toInput}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 pt-1">Baggage: {flight.baggage}</p>
                </div>

                <div className="flex sm:items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-xs text-slate-500 block">Estimated One-Way / Pax</span>
                    <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                      ₹{flight.price.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      Total for {pax} pax: ₹{(flight.price * pax).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setInspectFlight(inspectFlight?.id === flight.id ? null : flight)
                      }
                      className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectFlight(flight)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                        isChosen
                          ? 'bg-emerald-700 text-white'
                          : 'bg-teal-700 hover:bg-teal-800 text-white'
                      }`}
                    >
                      {isChosen ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{isChosen ? 'Selected for Trip' : 'Select Flight'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {inspectFlight?.id === flight.id && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <strong>Route & Aircraft:</strong> {flight.from} → {flight.to} ({flight.flightNumber}) · Airbus A320neo / Boeing 737 MAX
                  </div>
                  <div>
                    <strong>Baggage & Fare Rules:</strong> {flight.baggage} · Date change fee starts at ₹2,250 + fare difference.
                  </div>
                  <div>
                    <strong>Data Disclosure:</strong> Sample schedule & estimated fare for trip planning. Connect a live GDS/OTA API for real-time ticketing.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ============================================================================
// 2. HOTEL SEARCH COMPONENT
// ============================================================================
export const HotelSearchSection: React.FC<{
  destination: string;
  selectedHotel: HotelItem;
  onSelectHotel: (h: HotelItem) => void;
  savedHotels: string[];
  onToggleSaveHotel: (name: string) => void;
  darkMode: boolean;
}> = ({
  destination,
  selectedHotel,
  onSelectHotel,
  savedHotels,
  onToggleSaveHotel,
  darkMode,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<
    'All' | 'Budget' | 'Mid-Range' | 'Premium/Luxury'
  >('All');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance' | 'value'>('value');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHotelModal, setActiveHotelModal] = useState<HotelItem | null>(null);

  const filteredHotels = SAMPLE_HOTELS.filter((h) => {
    if (categoryFilter !== 'All' && h.category !== categoryFilter) return false;
    if (
      searchQuery.trim() &&
      !`${h.name} ${h.location} ${h.amenities.join(' ')}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price') return a.pricePerNight - b.pricePerNight;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'distance') return a.distanceFromCenterKm - b.distanceFromCenterKm;
    return b.rating / (b.pricePerNight / 1000) - a.rating / (a.pricePerNight / 1000);
  });

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            ESTIMATED NIGHTLY TARIFFS & SAMPLE AVAILABILITY · {destination}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            <span>Hotels & Stays by Category</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Explore Budget, Mid-Range, and Premium/Luxury stays with transparent nightly rates, attraction distances, and cancellation terms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          {(['All', 'Budget', 'Mid-Range', 'Premium/Luxury'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat === 'All' ? 'All Categories' : `${cat} Hotels`}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className={`p-4 rounded-xl border ${cardSurface} flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3`}>
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hotels by area (Candolim, Panaji, Palolem) or facility (Pool, Wi-Fi)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
          {(
            [
              { id: 'value', label: 'Best Value' },
              { id: 'price', label: 'Lowest Price' },
              { id: 'rating', label: 'Highest Rating' },
              { id: 'distance', label: 'Distance' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                sortBy === s.id
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => {
          const isSelected = selectedHotel.id === hotel.id;
          const isBookmarked = savedHotels.includes(hotel.name);
          return (
            <div
              key={hotel.id}
              className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-colors ${cardSurface} ${
                isSelected ? 'ring-2 ring-teal-600' : ''
              }`}
            >
              <div>
                <div className="h-48 w-full overflow-hidden relative">
                  <ResilientImage
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <p className="text-xs text-teal-200 font-medium">
                        {hotel.category} · {hotel.breakfastIncluded ? 'Breakfast Included' : 'Room Only'}
                      </p>
                      <h3 className="text-base font-semibold leading-snug">{hotel.name}</h3>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-semibold bg-black/60 px-2 py-1 rounded">
                      {hotel.rating}★ ({hotel.reviewsCount})
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="text-slate-500 dark:text-slate-400">
                    <span>{hotel.location}</span>
                    <span> · </span>
                    <span className="font-mono tabular-nums">{hotel.distanceLabel}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Amenities:</strong> {hotel.amenities.join(' · ')}
                  </p>

                  <p className="text-emerald-700 dark:text-emerald-400">
                    {hotel.cancellationPolicy}
                  </p>

                  <p className="text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                    Demo Status: ~{hotel.availableRoomsEstimate} rooms typically open in this category
                  </p>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block">Estimated / Night</span>
                  <span className="text-lg font-semibold font-mono tabular-nums">
                    ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleSaveHotel(hotel.name)}
                    className="px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    {isBookmarked ? 'Saved ★' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectHotel(hotel);
                      setActiveHotelModal(hotel);
                    }}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 text-white'
                    }`}
                  >
                    {isSelected ? 'Selected Hotel' : 'View Hotel'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeHotelModal && (
        <div className={`p-5 rounded-xl border ${cardSurface} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-sm text-teal-700 dark:text-teal-400">
              Active Trip Hotel Selected: {activeHotelModal.name} ({activeHotelModal.category})
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Location: {activeHotelModal.location} · Nightly Rate: ₹{activeHotelModal.pricePerNight.toLocaleString('en-IN')} · {activeHotelModal.cancellationPolicy}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveHotelModal(null)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap"
          >
            Dismiss Preview
          </button>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// 3. CAB / LOCAL TRANSPORT COMPONENT
// ============================================================================
export const CabTransportSection: React.FC<{
  bookedCabs: CabOption[];
  onToggleCab: (cab: CabOption) => void;
  darkMode: boolean;
}> = ({ bookedCabs, onToggleCab, darkMode }) => {
  const [routeFilter, setRouteFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const routeTypes = [
    'All',
    'Airport → Hotel',
    'Hotel → Tourist attractions',
    'Hotel → Railway station',
    'Hotel → Airport',
    'Local city rides',
  ];
  const cabCategories = ['All', 'Economy', 'Sedan', 'SUV', 'Premium', 'Auto/Rickshaw', 'Rental Car'];

  const filteredCabs = SAMPLE_CABS.filter((c) => {
    if (routeFilter !== 'All' && c.routeType !== routeFilter) return false;
    if (categoryFilter !== 'All' && c.cabCategory !== categoryFilter) return false;
    return true;
  });

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            ESTIMATED LOCAL CAB & RENTAL TARIFFS · Demo Reference Data
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Car className="w-6 h-6 text-teal-600" />
            <span>Cabs, Airport Transfers & Local Rides</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Plan Airport ↔ Hotel transfers, full-day sightseeing charters, railway station drops, autos, and self-drive rentals.
          </p>
        </div>
      </div>

      {/* Route & Category Filters */}
      <div className={`p-4 rounded-xl border ${cardSurface} space-y-3`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Route:</span>
          {routeTypes.map((rt) => (
            <button
              key={rt}
              type="button"
              onClick={() => setRouteFilter(rt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                routeFilter === rt
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              {rt}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 mr-1">Vehicle Type:</span>
          {cabCategories.map((cc) => (
            <button
              key={cc}
              type="button"
              onClick={() => setCategoryFilter(cc)}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                categoryFilter === cc
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {cc}
            </button>
          ))}
        </div>
      </div>

      {/* Cab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCabs.map((cab) => {
          const isAdded = bookedCabs.some((b) => b.id === cab.id);
          return (
            <div
              key={cab.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-colors ${cardSurface} ${
                isAdded ? 'ring-2 ring-teal-600' : ''
              }`}
            >
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    {cab.routeType}
                  </span>
                  <span className="font-mono tabular-nums">
                    {cab.cabCategory} · {cab.seats} Seats
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {cab.vehicleName}
                </h3>

                <div className="space-y-1 text-slate-600 dark:text-slate-300 pt-1">
                  <p>
                    <strong>Pickup:</strong> {cab.pickupLocation}
                  </p>
                  <p>
                    <strong>Drop:</strong> {cab.dropLocation}
                  </p>
                  <p className="font-mono tabular-nums text-slate-500">
                    Distance: ~{cab.distanceKm} km · Est. Time: ~{cab.estimatedTimeMinutes} mins
                  </p>
                </div>

                <p className="text-amber-700 dark:text-amber-400 pt-1">{cab.availabilityLabel}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Estimated Fare</span>
                  <span className="text-xl font-semibold font-mono tabular-nums">
                    ₹{cab.estimatedFare.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleCab(cab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'Added to Trip' : 'Book / Add Cab'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ============================================================================
// 4. FOOD & RESTAURANTS COMPONENT
// ============================================================================
export const FoodDiscoverySection: React.FC<{
  savedRestaurants: string[];
  onToggleRestaurant: (name: string) => void;
  darkMode: boolean;
}> = ({ savedRestaurants, onToggleRestaurant, darkMode }) => {
  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Budget' | 'Vegetarian' | 'Non-Vegetarian' | 'Local Food' | 'Family-Friendly' | 'Highly Rated'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFood = SAMPLE_RESTAURANTS.filter((r) => {
    if (activeFilter === 'Budget' && !r.isBudget) return false;
    if (activeFilter === 'Vegetarian' && r.dietary !== 'Vegetarian') return false;
    if (activeFilter === 'Non-Vegetarian' && r.dietary === 'Vegetarian') return false;
    if (activeFilter === 'Local Food' && !r.isLocalFood) return false;
    if (activeFilter === 'Family-Friendly' && !r.isFamilyFriendly) return false;
    if (activeFilter === 'Highly Rated' && r.rating < 4.6) return false;
    if (
      searchQuery.trim() &&
      !`${r.name} ${r.popularDishes.join(' ')} ${r.location}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Curated Local Dining · Approximate Per-Person Costs & Demo Hours
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-teal-600" />
            <span>Food, Cafes, Street Food & Local Specialities</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Discover Goan fish & veg thalis, artisanal bakery cafes, street food stalls, and family dining spots near your hotel.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-xl border ${cardSurface} flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              'All',
              'Budget',
              'Vegetarian',
              'Non-Vegetarian',
              'Local Food',
              'Family-Friendly',
              'Highly Rated',
            ] as const
          ).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                activeFilter === f
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes (Thali, Poi, Dosa)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFood.map((rest: RestaurantItem) => {
          const isSaved = savedRestaurants.includes(rest.name);
          return (
            <div
              key={rest.id}
              className={`rounded-xl border overflow-hidden flex flex-col justify-between ${cardSurface}`}
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden">
                  <ResilientImage
                    src={rest.image}
                    alt={rest.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <p className="text-xs text-teal-200">
                        {rest.category} · {rest.dietary}
                      </p>
                      <h3 className="text-base font-semibold">{rest.name}</h3>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-semibold bg-black/60 px-2 py-1 rounded">
                      {rest.rating}★
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {rest.location} · {rest.distanceFromHotelKm} km from hotel
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Popular Dishes:</strong> {rest.popularDishes.join(', ')}
                  </p>
                  <p className="text-slate-500 font-mono tabular-nums">
                    <strong>Hours:</strong> {rest.openingHours}
                  </p>
                  <p className="text-amber-700 dark:text-amber-400">{rest.openStatusLabel}</p>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Approx. Cost / Person</span>
                  <span className="text-lg font-semibold font-mono tabular-nums">
                    ₹{rest.costPerPerson}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleRestaurant(rest.name)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isSaved
                      ? 'bg-emerald-700 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved to Trip' : 'Add to Dining'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ============================================================================
// 5. TOURIST PLACES COMPONENT
// ============================================================================
export const TouristPlacesSection: React.FC<{
  savedPlaces: string[];
  onTogglePlace: (name: string) => void;
  darkMode: boolean;
}> = ({ savedPlaces, onTogglePlace, darkMode }) => {
  const [catFilter, setCatFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Popular Attraction',
    'Historical',
    'Beach',
    'Nature',
    'Religious/Temple',
    'Museum',
    'Shopping',
    'Entertainment',
    'Hidden Gem',
  ];

  const filteredPlaces = SAMPLE_PLACES.filter((p) => {
    if (catFilter !== 'All' && p.category !== catFilter) return false;
    if (
      searchQuery.trim() &&
      !`${p.name} ${p.description} ${p.location}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Destination Exploration · Forts, Beaches, Museums, Hidden Islands & Markets
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            <span>Places to Visit & Hidden Gems</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Check opening hours, entry fees, visiting durations, hotel distances, and add attractions directly to your trip plan.
          </p>
        </div>
      </div>

      {/* Category & Search Bar */}
      <div className={`p-4 rounded-xl border ${cardSurface} space-y-3`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                catFilter === cat
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attractions by name, history, island, or beach..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place: TouristPlaceItem) => {
          const isAdded = savedPlaces.includes(place.name);
          return (
            <div
              key={place.id}
              className={`rounded-xl border overflow-hidden flex flex-col justify-between ${cardSurface}`}
            >
              <div>
                <div className="h-48 w-full relative overflow-hidden">
                  <ResilientImage
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs text-teal-200">
                      {place.category} · {place.location}
                    </p>
                    <h3 className="text-base font-semibold leading-snug">{place.name}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {place.description}
                  </p>
                  <div className="pt-1 space-y-1 text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <p>
                      <strong>Hours:</strong> {place.openingHours}
                    </p>
                    <p>
                      <strong>Entry Fee:</strong> {place.entryFeeLabel}
                    </p>
                    <p>
                      <strong>Duration:</strong> {place.visitingTimeHours} · {place.distanceFromHotelKm} km from hotel
                    </p>
                    <p className="text-teal-700 dark:text-teal-400 font-sans">
                      <strong>Best Time:</strong> {place.bestTimeToVisit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {place.entryFee === 0 ? 'Free Entry' : `₹${place.entryFee}`}
                </span>

                <button
                  type="button"
                  onClick={() => onTogglePlace(place.name)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'Added to My Trip' : 'Add to My Trip'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
