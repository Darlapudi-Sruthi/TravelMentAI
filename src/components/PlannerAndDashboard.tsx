import React, { useState } from 'react';
import {
  AITripPlan,
  FlightItem,
  HotelItem,
  CabOption,
  TripType,
} from '../data/travelData';
import {
  User,
  UserProfileData,
  SavedTripRecord,
  signInWithGoogle,
  logOutUser,
  updateUserProfileData,
  saveTripToFirestore,
  deleteTripFromFirestore,
} from '../firebase';
import {
  Sparkles,
  Calendar,
  Download,
  Share2,
  Plus,
  Trash2,
  BookmarkCheck,
  UserCheck,
  LogIn,
  LogOut,
  Edit3,
  Clock,
  MapPin,
} from 'lucide-react';

const INTEREST_OPTIONS = [
  'Beaches',
  'Local Food',
  'Historical Places',
  'Nature & Backwaters',
  'Museums & Heritage',
  'Shopping & Markets',
  'Temples & Churches',
  'Hidden Gems',
];

export const CompleteAIPlannerSection: React.FC<{
  origin: string;
  setOrigin: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  travellers: number;
  setTravellers: (v: number) => void;
  tripType: TripType;
  setTripType: (v: TripType) => void;
  budget: number;
  setBudget: (v: number) => void;
  aiPlan: AITripPlan;
  setAiPlan: React.Dispatch<React.SetStateAction<AITripPlan>>;
  planSourceLabel: string;
  isGenerating: boolean;
  onGenerateAIPlan: (naturalPrompt?: string, interestsList?: string[]) => Promise<void>;
  darkMode: boolean;
}> = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  travellers,
  setTravellers,
  tripType,
  setTripType,
  budget,
  setBudget,
  aiPlan,
  setAiPlan,
  planSourceLabel,
  isGenerating,
  onGenerateAIPlan,
  darkMode,
}) => {
  const [naturalInput, setNaturalInput] = useState(
    'I want to travel from Hyderabad to Goa for 4 days with a budget of ₹25,000. I like beaches, local food and historical places.'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Beaches',
    'Local Food',
    'Historical Places',
  ]);
  const [newSlotDay, setNewSlotDay] = useState<number>(1);
  const [newSlotTime, setNewSlotTime] = useState('03:30 PM');
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotCost, setNewSlotCost] = useState(300);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTitle.trim()) return;
    setAiPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayNumber === newSlotDay
          ? {
              ...d,
              dailyCostEstimate: d.dailyCostEstimate + newSlotCost,
              slots: [
                ...d.slots,
                {
                  time: newSlotTime,
                  title: newSlotTitle.trim(),
                  category: 'Attraction',
                  details: 'Custom traveller-added activity slot.',
                  distanceAndTravelTime: '2.5 km from hotel · 10 mins',
                  openingHours: '09:00 AM – 07:00 PM',
                  estimatedCost: newSlotCost,
                },
              ],
            }
          : d
      ),
    }));
    setNewSlotTitle('');
  };

  const handleRemoveSlot = (dayNumber: number, slotIndex: number) => {
    setAiPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        const removed = d.slots[slotIndex];
        return {
          ...d,
          dailyCostEstimate: Math.max(0, d.dailyCostEstimate - (removed?.estimatedCost || 0)),
          slots: d.slots.filter((_, idx) => idx !== slotIndex),
        };
      }),
    }));
  };

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            {planSourceLabel}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <span>Complete AI Trip Planner & Smart Recommendation Engine</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Describe your trip in plain language or adjust parameters below. Our AI coordinates transport, hotel zones, opening hours, travel distances, and daily budgets.
          </p>
        </div>
      </div>

      {/* Smart Recommendation Natural Language Box + Structured Inputs */}
      <div className={`p-6 rounded-xl border ${cardSurface} space-y-5`}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Smart Natural-Language Trip Prompt
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g., I have ₹20,000 and 4 days. I like beaches, local food and historical places."
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onGenerateAIPlan(naturalInput, selectedInterests)}
              className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating AI Plan...' : 'Generate Complete AI Plan'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Starting Location</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Departure Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Return Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Total Budget (₹)</label>
            <input
              type="number"
              min={3000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Math.max(3000, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Travellers & Type</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min={1}
                max={20}
                value={travellers}
                onChange={(e) => setTravellers(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
              />
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as TripType)}
                className="flex-1 px-2 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Solo">Solo</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interests Selector */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-500 mr-1">Interests:</span>
          {INTEREST_OPTIONS.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Plan Overview Card */}
      <div className={`p-6 rounded-xl border ${cardSurface} space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">
              Recommended Tier: {aiPlan.recommendedTier} · Hub: {aiPlan.recommendedHotelArea}
            </p>
            <h3 className="text-xl font-semibold mt-0.5">{aiPlan.tripTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
              {aiPlan.summary}
            </p>
          </div>
          <div className="text-left lg:text-right font-mono tabular-nums shrink-0">
            <span className="text-xs text-slate-500 block">AI Estimated Total</span>
            <span className="text-2xl font-semibold text-teal-700 dark:text-teal-400">
              ₹{aiPlan.budgetBreakdown.totalEstimated.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Day-by-Day Timeline */}
        <div className="space-y-6 pt-2">
          {aiPlan.days.map((day) => (
            <div
              key={day.dayNumber}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Day {day.dayNumber}
                  </span>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {day.theme}
                  </h4>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  Day Estimate: ₹{day.dailyCostEstimate.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-3">
                {day.slots.map((slot, sIdx) => (
                  <div
                    key={`${day.dayNumber}-${sIdx}`}
                    className={`p-3.5 rounded-lg border ${cardSurface} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
                          {slot.time}
                        </span>
                        <span>·</span>
                        <span>{slot.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {slot.distanceAndTravelTime}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {slot.openingHours}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {slot.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{slot.details}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-xs font-mono tabular-nums font-semibold">
                        {slot.estimatedCost === 0
                          ? 'Included / Free'
                          : `₹${slot.estimatedCost.toLocaleString('en-IN')}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(day.dayNumber, sIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Activity Form */}
        <form
          onSubmit={handleAddCustomActivity}
          className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Day</label>
            <select
              value={newSlotDay}
              onChange={(e) => setNewSlotDay(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {aiPlan.days.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Time</label>
            <input
              type="text"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
            />
          </div>
          <div className="sm:col-span-5">
            <label className="block text-xs text-slate-500 mb-1">New Activity Title</label>
            <input
              type="text"
              value={newSlotTitle}
              onChange={(e) => setNewSlotTitle(e.target.value)}
              placeholder="e.g., Sunset Kayaking at Aguada River..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <div className="w-24">
              <label className="block text-xs text-slate-500 mb-1">Cost (₹)</label>
              <input
                type="number"
                min={0}
                value={newSlotCost}
                onChange={(e) => setNewSlotCost(Math.max(0, Number(e.target.value)))}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono tabular-nums"
              />
            </div>
            <button
              type="submit"
              className="flex-1 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

// ============================================================================
// SECTION 12 & 15: PERSONAL TRIP DASHBOARD ("My Trips") & USER ACCOUNT
// ============================================================================
export const TripDashboardSection: React.FC<{
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  tripType: TripType;
  totalBudget: number;
  selectedFlight: FlightItem;
  selectedHotel: HotelItem;
  bookedCabs: CabOption[];
  savedHotels: string[];
  savedRestaurants: string[];
  savedPlaces: string[];
  aiPlan: AITripPlan;
  user: User | null;
  userProfile: UserProfileData | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileData | null>>;
  savedTripsList: SavedTripRecord[];
  onLoadSavedTrip: (trip: SavedTripRecord) => void;
  onNavigateTab: (tab: string) => void;
  darkMode: boolean;
}> = ({
  origin,
  destination,
  startDate,
  endDate,
  travellers,
  tripType,
  totalBudget,
  selectedFlight,
  selectedHotel,
  bookedCabs,
  savedHotels,
  savedRestaurants,
  savedPlaces,
  aiPlan,
  user,
  userProfile,
  setUserProfile,
  savedTripsList,
  onLoadSavedTrip,
  onNavigateTab,
  darkMode,
}) => {
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [savingTrip, setSavingTrip] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profName, setProfName] = useState(userProfile?.displayName || 'Traveller');
  const [profCity, setProfCity] = useState(userProfile?.homeCity || 'Hyderabad');
  const [profCurrency, setProfCurrency] = useState<'INR' | 'USD' | 'EUR'>(
    userProfile?.preferredCurrency || 'INR'
  );
  const [profStyle, setProfStyle] = useState<'Budget' | 'Standard' | 'Premium'>(
    userProfile?.travelStyle || 'Standard'
  );

  const handleDownloadItinerary = () => {
    const lines: string[] = [
      `============================================================`,
      `TRAVELMATE AI — PERSONAL TRIP ITINERARY & BUDGET SUMMARY`,
      `============================================================`,
      `Route: ${origin} -> ${destination}`,
      `Dates: ${startDate} to ${endDate} | Travellers: ${travellers} (${tripType})`,
      `Estimated Total Cost: INR ${totalBudget.toLocaleString('en-IN')}`,
      `Selected Flight (Sample): ${selectedFlight.airline} ${selectedFlight.flightNumber} (${selectedFlight.departureTime} - ${selectedFlight.arrivalTime})`,
      `Selected Hotel (Estimated): ${selectedHotel.name} (${selectedHotel.location}) - INR ${selectedHotel.pricePerNight}/night`,
      `Saved Places: ${savedPlaces.join(', ') || 'None'}`,
      `Saved Dining: ${savedRestaurants.join(', ') || 'None'}`,
      ``,
      `DAILY ITINERARY:`,
    ];

    aiPlan.days.forEach((d) => {
      lines.push(`\n--- Day ${d.dayNumber}: ${d.theme} (Est. INR ${d.dailyCostEstimate}) ---`);
      d.slots.forEach((s) => {
        lines.push(`  [${s.time}] ${s.title} (${s.category}) - INR ${s.estimatedCost}`);
        lines.push(`    ${s.details} | ${s.distanceAndTravelTime}`);
      });
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TravelMate_${destination}_Itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusBanner('Itinerary downloaded as TravelMate_' + destination + '_Itinerary.txt');
  };

  const handleShareTrip = async () => {
    const shareText = `My TravelMate AI Trip: ${origin} → ${destination} (${startDate} to ${endDate}) · ${travellers} Travellers · Est. Budget ₹${totalBudget.toLocaleString(
      'en-IN'
    )} · Stay: ${selectedHotel.name} · Places: ${savedPlaces.slice(0, 4).join(', ')}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setStatusBanner('Trip summary copied to clipboard! Ready to share with family or friends.');
    } catch {
      setStatusBanner(shareText);
    }
  };

  const handleSaveTripCloud = async () => {
    if (!user) {
      setStatusBanner('Please sign in with Google below to save your trip to your cloud account.');
      return;
    }
    setSavingTrip(true);
    try {
      const tripId = `trip_${destination.toLowerCase().replace(/[^a-z0-9]/g, '')}_${startDate.replace(/[^0-9]/g, '')}`;
      const summaryStr = aiPlan.days
        .map((d) => `Day ${d.dayNumber}: ${d.theme}`)
        .join(' | ')
        .slice(0, 4800);

      await saveTripToFirestore(user, {
        tripId,
        origin,
        destination,
        startDate,
        endDate,
        travellers,
        tripType,
        totalBudget,
        savedHotels,
        savedRestaurants,
        savedPlaces,
        itinerarySummary: summaryStr,
      });
      setStatusBanner('Trip, hotels, restaurants, and places saved to your account!');
    } catch (err: unknown) {
      setStatusBanner(err instanceof Error ? err.message : 'Could not save trip.');
    } finally {
      setSavingTrip(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserProfileData(user.uid, {
        displayName: profName,
        homeCity: profCity,
        preferredCurrency: profCurrency,
        travelStyle: profStyle,
      });
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: profName,
              homeCity: profCity,
              preferredCurrency: profCurrency,
              travelStyle: profStyle,
            }
          : null
      );
      setEditingProfile(false);
      setStatusBanner('Profile preferences updated.');
    } catch (err: unknown) {
      setStatusBanner(err instanceof Error ? err.message : 'Profile update failed.');
    }
  };

  const cardSurface = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <section className="space-y-8">
      {/* Header + Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Personal Travel Command Center · My Trips & Saved Bookmarks
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            <span>My Trip Dashboard: {origin} → {destination}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            {startDate} to {endDate} · {travellers} Traveller(s) ({tripType}) · Est. Total Cost: ₹{totalBudget.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('AI Planner')}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Trip & Activities</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadItinerary}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Itinerary</span>
          </button>
          <button
            type="button"
            onClick={handleShareTrip}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Trip</span>
          </button>
          <button
            type="button"
            disabled={savingTrip}
            onClick={handleSaveTripCloud}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>{savingTrip ? 'Saving...' : 'Save Trip to Account'}</span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div className="p-3.5 rounded-lg border border-teal-600/40 bg-teal-50/70 dark:bg-teal-950/40 text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between">
          <span>{statusBanner}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs underline ml-4 whitespace-nowrap"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Grid: Flight, Hotel, Cabs, Saved Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-5 rounded-xl border ${cardSurface} space-y-2 text-xs`}>
          <span className="text-slate-500 font-medium">Selected Flight (Demo)</span>
          <p className="text-base font-semibold">
            {selectedFlight.airline} · {selectedFlight.flightNumber}
          </p>
          <p className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
            {selectedFlight.departureTime} → {selectedFlight.arrivalTime} ({selectedFlight.durationLabel})
          </p>
          <p className="font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
            ₹{selectedFlight.price.toLocaleString('en-IN')} / pax
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${cardSurface} space-y-2 text-xs`}>
          <span className="text-slate-500 font-medium">Selected Hotel (Estimated)</span>
          <p className="text-base font-semibold">{selectedHotel.name}</p>
          <p className="text-slate-600 dark:text-slate-300">{selectedHotel.location}</p>
          <p className="font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400">
            ₹{selectedHotel.pricePerNight.toLocaleString('en-IN')} / night · {selectedHotel.rating}★
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${cardSurface} space-y-2 text-xs`}>
          <span className="text-slate-500 font-medium">Selected Cabs ({bookedCabs.length})</span>
          {bookedCabs.slice(0, 2).map((c) => (
            <div key={c.id} className="flex justify-between font-mono tabular-nums">
              <span className="truncate pr-2">{c.routeType}</span>
              <span>₹{c.estimatedFare}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onNavigateTab('Cabs')}
            className="text-teal-700 dark:text-teal-400 font-semibold hover:underline pt-1 inline-block"
          >
            Manage Local Rides →
          </button>
        </div>

        <div className={`p-5 rounded-xl border ${cardSurface} space-y-2 text-xs`}>
          <span className="text-slate-500 font-medium">Saved Places & Dining</span>
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Attractions ({savedPlaces.length}):</strong> {savedPlaces.slice(0, 2).join(', ') || 'None yet'}
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Restaurants ({savedRestaurants.length}):</strong>{' '}
            {savedRestaurants.slice(0, 2).join(', ') || 'None yet'}
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Saved Hotels ({savedHotels.length}):</strong>{' '}
            {savedHotels.slice(0, 2).join(', ') || 'None yet'}
          </p>
        </div>
      </div>

      {/* User Account & Cloud Saved Trips Panel */}
      <div className={`p-6 rounded-xl border ${cardSurface} space-y-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Traveller Account, Saved Trips & Profile</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in with Google to sync saved trips, bookmarked hotels, restaurants, and tourist places across devices.
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setProfName(userProfile?.displayName || user.displayName || 'Traveller');
                  setProfCity(userProfile?.homeCity || 'Hyderabad');
                  setProfCurrency(userProfile?.preferredCurrency || 'INR');
                  setProfStyle(userProfile?.travelStyle || 'Standard');
                  setEditingProfile((v) => !v);
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap"
              >
                {editingProfile ? 'Close Profile Editor' : 'Manage Profile'}
              </button>
              <button
                type="button"
                onClick={() => logOutUser()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 flex items-center gap-1 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up with Google</span>
            </button>
          )}
        </div>

        {editingProfile && user && (
          <form
            onSubmit={handleProfileSave}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs text-slate-500 mb-1">Display Name</label>
              <input
                type="text"
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Home City</label>
              <input
                type="text"
                value={profCity}
                onChange={(e) => setProfCity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Travel Style</label>
              <select
                value={profStyle}
                onChange={(e) =>
                  setProfStyle(e.target.value as 'Budget' | 'Standard' | 'Premium')
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Budget">Budget</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold whitespace-nowrap"
            >
              Save Profile Settings
            </button>
          </form>
        )}

        {/* Saved Trips History */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500">
            Saved Cloud Trips ({savedTripsList.length})
          </h4>
          {savedTripsList.length === 0 ? (
            <p className="text-xs text-slate-500">
              {user
                ? 'No saved trips yet. Click "Save Trip to Account" above to store your current Goa itinerary.'
                : 'Sign in with Google to view and manage your saved trips.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedTripsList.map((item) => (
                <div
                  key={item.tripId}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {item.origin} → {item.destination} ({item.tripType})
                    </p>
                    <p className="font-mono tabular-nums text-slate-500">
                      {item.startDate} to {item.endDate} · {item.travellers} Pax · ₹
                      {item.totalBudget.toLocaleString('en-IN')}
                    </p>
                    <p className="text-slate-500 truncate max-w-md">{item.itinerarySummary}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLoadSavedTrip(item)}
                      className="px-3 py-1.5 rounded-md bg-teal-700 text-white font-semibold whitespace-nowrap"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTripFromFirestore(item.tripId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                      title="Delete Saved Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
