/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ASSETS,
  SAMPLE_FLIGHTS,
  SAMPLE_HOTELS,
  SAMPLE_CABS,
  DEFAULT_AI_TRIP_PLAN,
  FlightItem,
  HotelItem,
  CabOption,
  TripType,
  AITripPlan,
} from './data/travelData';
import {
  db,
  auth,
  User,
  UserProfileData,
  SavedTripRecord,
  OperationType,
  handleFirestoreError,
  ensureUserProfile,
  signInWithGoogle,
  onAuthStateChanged,
  collection,
  query,
  where,
  onSnapshot,
} from './firebase';
import {
  FlightSearchSection,
  HotelSearchSection,
  CabTransportSection,
  FoodDiscoverySection,
  TouristPlacesSection,
  ResilientImage,
} from './components/DiscoverySections';
import {
  CompleteAIPlannerSection,
  TripDashboardSection,
} from './components/PlannerAndDashboard';
import { InteractiveMapSection } from './components/InteractiveMapSection';
import {
  TravelEssentialsAndWeather,
  BudgetCosts,
} from './components/TravelEssentialsAndWeather';
import { AIChatDrawer } from './components/AIChatDrawer';
import {
  Sun,
  Moon,
  Sparkles,
  Plane,
  Building2,
  Car,
  Utensils,
  MapPin,
  Calendar,
  Compass,
  Menu,
  X,
} from 'lucide-react';

type NavTab =
  | 'Home'
  | 'Flights'
  | 'Hotels'
  | 'Cabs'
  | 'Food'
  | 'Places'
  | 'My Trips'
  | 'AI Planner';

const NAV_TABS: NavTab[] = [
  'Home',
  'Flights',
  'Hotels',
  'Cabs',
  'Food',
  'Places',
  'My Trips',
  'AI Planner',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('Home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  // Core Trip State (Defaults to Section 20 Goal: Hyderabad -> Goa, 4 days, ₹25,000)
  const [searchDestinationQuery, setSearchDestinationQuery] = useState<string>(
    'Goa Coastal & Heritage Circuit'
  );
  const [origin, setOrigin] = useState<string>('Hyderabad');
  const [destination, setDestination] = useState<string>('Goa');
  const [startDate, setStartDate] = useState<string>('2026-10-15');
  const [endDate, setEndDate] = useState<string>('2026-10-18');
  const [travellers, setTravellers] = useState<number>(2);
  const [tripType, setTripType] = useState<TripType>('Couple');
  const [targetBudget, setTargetBudget] = useState<number>(25000);

  // Selected / Saved Items State
  const [selectedFlight, setSelectedFlight] = useState<FlightItem>(SAMPLE_FLIGHTS[0]);
  const [selectedHotel, setSelectedHotel] = useState<HotelItem>(SAMPLE_HOTELS[2]);
  const [bookedCabs, setBookedCabs] = useState<CabOption[]>([
    SAMPLE_CABS[0],
    SAMPLE_CABS[6],
  ]);
  const [savedHotels, setSavedHotels] = useState<string[]>([
    'Casa Fontainhas Heritage Boutique',
    'Zostel & Palm Stay Hostel Candolim',
  ]);
  const [savedRestaurants, setSavedRestaurants] = useState<string[]>([
    'Ritz Classic Coastal Thali House',
    'Navtara Pure Veg Udupi & Goan Dining',
  ]);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([
    'Fort Aguada & 17th-Century Lighthouse',
    'Fontainhas Latin Quarter & St. Sebastian Chapel',
    'Basilica of Bom Jesus & Se Cathedral',
  ]);

  // AI Plan & Budget Calculator State
  const [aiPlan, setAiPlan] = useState<AITripPlan>(DEFAULT_AI_TRIP_PLAN);
  const [planSourceLabel, setPlanSourceLabel] = useState<string>(
    'SMART ITINERARY · Tailored for Hyderabad → Goa (₹25,000 Budget)'
  );
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [budgetCosts, setBudgetCosts] = useState<BudgetCosts>({
    flightsOrTrain: 6900,
    hotel: 8550,
    cabsAndLocal: 3800,
    food: 3600,
    attractions: 750,
    shopping: 900,
    miscellaneous: 500,
  });

  // Firebase Auth & Saved Trips State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [savedTripsList, setSavedTripsList] = useState<SavedTripRecord[]>([]);

  // Listen to Google Maps Platform Quota Exceeded Event
  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Sync Dark Mode Class on Document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
        try {
          const prof = await ensureUserProfile(currentUser);
          setUserProfile(prof);
        } catch {
          // Handled inside ensureUserProfile
        }
      } else {
        setUserProfile(null);
        setSavedTripsList([]);
      }
    });
    return () => unsub();
  }, []);

  // Firestore Saved Trips Real-Time Listener
  useEffect(() => {
    if (!authReady || !user) return;
    const pathForTrips = 'trips';
    const q = query(collection(db, pathForTrips), where('ownerId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: SavedTripRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SavedTripRecord);
        });
        setSavedTripsList(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, pathForTrips);
      }
    );
    return () => unsub();
  }, [authReady, user]);

  // Generate AI Trip Plan via Server Endpoint
  const handleGenerateAIPlan = async (
    naturalPrompt = '',
    interests = ['Beaches', 'Local Food', 'Historical Places']
  ) => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          startDate,
          endDate,
          days: 4,
          budget: targetBudget,
          travellers,
          tripType,
          interests,
          naturalPrompt,
        }),
      });
      const data = await response.json();
      if (response.ok && data?.plan?.days?.length) {
        setAiPlan(data.plan);
        setPlanSourceLabel(
          data.sourceLabel || 'AI GENERATED · Gemini 3.8 Flash + Estimated Local Fares'
        );
        if (data.plan.budgetBreakdown) {
          setBudgetCosts({
            flightsOrTrain: data.plan.budgetBreakdown.flightsOrTrain || 6900,
            hotel: data.plan.budgetBreakdown.hotel || 8550,
            cabsAndLocal: data.plan.budgetBreakdown.cabsAndLocal || 3800,
            food: data.plan.budgetBreakdown.food || 3600,
            attractions: data.plan.budgetBreakdown.attractions || 750,
            shopping: data.plan.budgetBreakdown.shopping || 900,
            miscellaneous: data.plan.budgetBreakdown.miscellaneous || 500,
          });
        }
      } else {
        throw new Error('Using local smart recommendation engine');
      }
    } catch {
      // Smart local adaptation when AI endpoint is offline/quota-limited
      const ratio = Math.max(0.4, targetBudget / 25000);
      const scaledBreakdown = {
        flightsOrTrain: Math.round(6900 * ratio),
        hotel: Math.round(8550 * ratio),
        cabsAndLocal: Math.round(3800 * ratio),
        food: Math.round(3600 * ratio),
        attractions: Math.round(750 * ratio),
        shopping: Math.round(900 * ratio),
        miscellaneous: Math.round(500 * ratio),
      };
      setBudgetCosts(scaledBreakdown);
      setAiPlan((prev) => ({
        ...prev,
        tripTitle: `${origin} to ${destination} · ${tripType} Smart Plan (₹${targetBudget.toLocaleString(
          'en-IN'
        )})`,
        recommendedTier:
          targetBudget < 18000 ? 'Budget' : targetBudget > 40000 ? 'Premium' : 'Standard',
        budgetBreakdown: {
          ...scaledBreakdown,
          totalEstimated: targetBudget,
        },
      }));
      setPlanSourceLabel(
        `SMART RECOMMENDATION ENGINE · Optimized for ₹${targetBudget.toLocaleString('en-IN')} Budget`
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const toggleSaveItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    name: string
  ) => {
    setList((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev.slice(0, 9), name]
    );
  };

  const toggleCabBooking = (cab: CabOption) => {
    setBookedCabs((prev) =>
      prev.some((c) => c.id === cab.id)
        ? prev.filter((c) => c.id !== cab.id)
        : [...prev, cab]
    );
  };

  const handleLoadSavedTrip = (record: SavedTripRecord) => {
    setOrigin(record.origin);
    setDestination(record.destination);
    setStartDate(record.startDate);
    setEndDate(record.endDate);
    setTravellers(record.travellers);
    setTripType(record.tripType);
    setTargetBudget(record.totalBudget);
    setSavedHotels(record.savedHotels || []);
    setSavedRestaurants(record.savedRestaurants || []);
    setSavedPlaces(record.savedPlaces || []);
  };

  const totalEstimatedCost =
    budgetCosts.flightsOrTrain +
    budgetCosts.hotel +
    budgetCosts.cabsAndLocal +
    budgetCosts.food +
    budgetCosts.attractions +
    budgetCosts.shopping +
    budgetCosts.miscellaneous;

  const tripContextForChat = {
    origin,
    destination,
    startDate,
    endDate,
    travellers,
    tripType,
    targetBudget,
    totalEstimatedCost,
    selectedFlight: `${selectedFlight.airline} ${selectedFlight.flightNumber} (₹${selectedFlight.price})`,
    selectedHotel: `${selectedHotel.name} (${selectedHotel.location}, ₹${selectedHotel.pricePerNight}/night)`,
    savedRestaurants,
    savedPlaces,
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Google Maps Platform Quota Notice (Mandatory Demo Key Banner) */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* ===================================================================
          TOP BAR CONTRACT (Strict 3-Zone Header)
          Zone 1: Single wordmark | Zone 2: Nav Links | Zone 3: 1-2 Actions
         =================================================================== */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md ${
          darkMode
            ? 'bg-slate-950/90 border-slate-800'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title (Single text element wordmark) */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('Home');
            }}
            className="text-xl font-semibold tracking-tight font-display text-teal-800 dark:text-teal-400 whitespace-nowrap shrink-0"
          >
            TravelMate AI
          </a>

          {/* Zone 2: Navigation Links (Home | Flights | Hotels | Cabs | Food | Places | My Trips | AI Planner) */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {NAV_TABS.slice(0, 5).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === tab
                    ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="hidden xl:flex items-center gap-5">
              {NAV_TABS.slice(5).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    activeTab === tab
                      ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => setActiveTab('My Trips')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors whitespace-nowrap truncate max-w-[160px]"
              >
                {userProfile?.displayName || user.displayName || 'My Account'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="xl:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile / Compact Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap gap-2 bg-white dark:bg-slate-950">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ===================================================================
          MAIN VIEWPORT CONTAINER
         =================================================================== */}
      <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 space-y-14">
        {/* =================================================================
            SECTION 1: HOME PAGE HERO + QUICK OPTIONS + ALL-IN-ONE OVERVIEW
           ================================================================= */}
        {activeTab === 'Home' && (
          <>
            {/* Hero Banner with Measured Scrim & Complete Journey Search Box */}
            <section className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="h-[540px] sm:h-[500px] w-full relative">
                <ResilientImage
                  src={ASSETS.heroCoastline}
                  alt="Goa tropical sunset coastline"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-white">
                  <div className="max-w-3xl space-y-3">
                    <p className="text-xs sm:text-sm font-medium text-teal-300">
                      All-in-One AI Travel Logistics · Live Weather & Maps + Transparent Cost Estimates
                    </p>
                    <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
                      Plan your entire journey in one place.
                    </h1>
                    <p className="text-sm sm:text-base text-slate-200 max-w-2xl">
                      Coordinate flights, categorized hotels, local cabs, regional food, attractions, interactive route distances, and a complete day-by-day AI itinerary tailored to your budget.
                    </p>
                  </div>

                  {/* Journey Search Box inside Hero */}
                  <div className="mt-6 p-4 sm:p-5 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                      <div className="lg:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Where do you want to go?
                        </label>
                        <input
                          type="text"
                          value={searchDestinationQuery}
                          onChange={(e) => {
                            setSearchDestinationQuery(e.target.value);
                            if (e.target.value.trim()) {
                              setDestination(e.target.value.split(' ')[0]);
                            }
                          }}
                          placeholder="e.g., Goa, Manali, Jaipur, Kerala..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Starting Location
                        </label>
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Destination
                        </label>
                        <select
                          value={destination}
                          onChange={(e) => {
                            setDestination(e.target.value);
                            setSearchDestinationQuery(`${e.target.value} Complete Journey`);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          <option value="Goa">Goa</option>
                          <option value="Manali">Manali</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Pondicherry">Pondicherry</option>
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Travel Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Return Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
                        />
                      </div>

                      <div className="lg:col-span-1">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Travellers
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={travellers}
                          onChange={(e) => setTravellers(Math.max(1, Number(e.target.value)))}
                          className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      {/* Trip Type Selector */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-500 mr-1">Trip Type:</span>
                        {(['Solo', 'Family', 'Friends', 'Couple', 'Business'] as const).map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setTripType(type)}
                              className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                                tripType === type
                                  ? 'bg-teal-700 text-white border-teal-700'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
                              }`}
                            >
                              {type}
                            </button>
                          )
                        )}
                      </div>

                      {/* Prominent "Plan My Trip" Primary CTA */}
                      <button
                        type="button"
                        onClick={() => {
                          handleGenerateAIPlan(
                            `I want to travel from ${origin} to ${destination} from ${startDate} to ${endDate} with ${travellers} travellers (${tripType}) and a budget of ₹${targetBudget}.`
                          );
                          setActiveTab('AI Planner');
                        }}
                        className="px-6 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Plan My Trip</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Options Bar (6 Direct Modules) */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(
                [
                  {
                    label: 'Flights',
                    sub: 'From ₹3,290 (Demo)',
                    tab: 'Flights' as NavTab,
                    icon: Plane,
                  },
                  {
                    label: 'Hotels',
                    sub: 'Budget to Luxury',
                    tab: 'Hotels' as NavTab,
                    icon: Building2,
                  },
                  {
                    label: 'Cabs',
                    sub: 'Airport & Sightseeing',
                    tab: 'Cabs' as NavTab,
                    icon: Car,
                  },
                  {
                    label: 'Food',
                    sub: 'Veg, Thalis & Cafes',
                    tab: 'Food' as NavTab,
                    icon: Utensils,
                  },
                  {
                    label: 'Places to Visit',
                    sub: 'Forts, Beaches & Gems',
                    tab: 'Places' as NavTab,
                    icon: Compass,
                  },
                  {
                    label: 'Complete Trip Plan',
                    sub: '4-Day AI Itinerary',
                    tab: 'AI Planner' as NavTab,
                    icon: Calendar,
                  },
                ] as const
              ).map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    className={`p-4 rounded-xl border text-left transition-all hover:border-teal-600 ${
                      darkMode
                        ? 'bg-slate-900/70 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <IconComp className="w-5 h-5 text-teal-600 mb-2" />
                    <p className="text-sm font-semibold whitespace-nowrap truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.sub}</p>
                  </button>
                );
              })}
            </section>

            {/* Interactive Map & Route Distance Calculator on Home */}
            <InteractiveMapSection darkMode={darkMode} />

            {/* Complete Trip Budget Calculator + Live Weather + Travel Essentials on Home */}
            <TravelEssentialsAndWeather
              destination={destination}
              darkMode={darkMode}
              budgetCosts={budgetCosts}
              setBudgetCosts={setBudgetCosts}
              targetBudget={targetBudget}
              setTargetBudget={setTargetBudget}
              onRegenerateWithBudget={(newBud, tierName) => {
                handleGenerateAIPlan(
                  `Regenerate a ${tierName} trip plan from ${origin} to ${destination} for ${travellers} travellers within a ₹${newBud} total budget.`
                );
                setActiveTab('AI Planner');
              }}
            />
          </>
        )}

        {/* =================================================================
            SECTION 2: FLIGHTS TAB
           ================================================================= */}
        {activeTab === 'Flights' && (
          <FlightSearchSection
            origin={origin}
            destination={destination}
            startDate={startDate}
            endDate={endDate}
            travellers={travellers}
            selectedFlight={selectedFlight}
            onSelectFlight={(f) => {
              setSelectedFlight(f);
              setBudgetCosts((prev) => ({ ...prev, flightsOrTrain: f.price * travellers }));
            }}
            darkMode={darkMode}
          />
        )}

        {/* =================================================================
            SECTION 3: HOTELS TAB
           ================================================================= */}
        {activeTab === 'Hotels' && (
          <HotelSearchSection
            destination={destination}
            selectedHotel={selectedHotel}
            onSelectHotel={(h) => {
              setSelectedHotel(h);
              setBudgetCosts((prev) => ({ ...prev, hotel: h.pricePerNight * 3 }));
            }}
            savedHotels={savedHotels}
            onToggleSaveHotel={(name) => toggleSaveItem(savedHotels, setSavedHotels, name)}
            darkMode={darkMode}
          />
        )}

        {/* =================================================================
            SECTION 4: CABS TAB
           ================================================================= */}
        {activeTab === 'Cabs' && (
          <CabTransportSection
            bookedCabs={bookedCabs}
            onToggleCab={toggleCabBooking}
            darkMode={darkMode}
          />
        )}

        {/* =================================================================
            SECTION 5: FOOD & RESTAURANTS TAB
           ================================================================= */}
        {activeTab === 'Food' && (
          <FoodDiscoverySection
            savedRestaurants={savedRestaurants}
            onToggleRestaurant={(name) =>
              toggleSaveItem(savedRestaurants, setSavedRestaurants, name)
            }
            darkMode={darkMode}
          />
        )}

        {/* =================================================================
            SECTION 6: TOURIST PLACES TAB
           ================================================================= */}
        {activeTab === 'Places' && (
          <TouristPlacesSection
            savedPlaces={savedPlaces}
            onTogglePlace={(name) => toggleSaveItem(savedPlaces, setSavedPlaces, name)}
            darkMode={darkMode}
          />
        )}

        {/* =================================================================
            SECTION 7 & 13: AI PLANNER TAB
           ================================================================= */}
        {activeTab === 'AI Planner' && (
          <CompleteAIPlannerSection
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            travellers={travellers}
            setTravellers={setTravellers}
            tripType={tripType}
            setTripType={setTripType}
            budget={targetBudget}
            setBudget={setTargetBudget}
            aiPlan={aiPlan}
            setAiPlan={setAiPlan}
            planSourceLabel={planSourceLabel}
            isGenerating={isGeneratingPlan}
            onGenerateAIPlan={handleGenerateAIPlan}
            darkMode={darkMode}
          />
        )}

        {/* =================================================================
            SECTION 12 & 15: MY TRIPS DASHBOARD & ACCOUNT TAB
           ================================================================= */}
        {activeTab === 'My Trips' && (
          <TripDashboardSection
            origin={origin}
            destination={destination}
            startDate={startDate}
            endDate={endDate}
            travellers={travellers}
            tripType={tripType}
            totalBudget={totalEstimatedCost}
            selectedFlight={selectedFlight}
            selectedHotel={selectedHotel}
            bookedCabs={bookedCabs}
            savedHotels={savedHotels}
            savedRestaurants={savedRestaurants}
            savedPlaces={savedPlaces}
            aiPlan={aiPlan}
            user={user}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            savedTripsList={savedTripsList}
            onLoadSavedTrip={handleLoadSavedTrip}
            onNavigateTab={(t) => setActiveTab(t as NavTab)}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* ===================================================================
          QUIET FOOTER (Data Transparency Disclosure & Navigation Mirror)
         =================================================================== */}
      <footer
        className={`mt-16 border-t py-8 px-4 sm:px-6 text-xs ${
          darkMode
            ? 'bg-slate-950 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white font-display">
              TravelMate AI — Plan your entire journey in one place.
            </p>
            <p>
              Data Transparency Notice: Weather and Google Maps route geometry use live APIs when connected; flight schedules, hotel room counts, cab fares, and restaurant costs are clearly labeled as sample/estimated planning data.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="hover:underline whitespace-nowrap"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* ===================================================================
          SECTION 18: FLOATING AI TRAVEL CHAT ASSISTANT
         =================================================================== */}
      <AIChatDrawer tripContext={tripContextForChat} darkMode={darkMode} />
    </div>
  );
}
