import React, { useState, useEffect } from 'react';
import {
  TRAVEL_ESSENTIALS_DATA,
  DESTINATION_COORDS,
} from '../data/travelData';
import {
  CloudSun,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  ShieldAlert,
  CheckSquare,
  Square,
  Plus,
  Calculator,
  RefreshCw,
} from 'lucide-react';

export interface WeatherPayload {
  isLive: boolean;
  sourceLabel: string;
  city: string;
  temperature: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  condition: string;
  sunrise: string;
  sunset: string;
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    rainProb: number;
    condition: string;
    sunrise: string;
    sunset: string;
  }>;
}

export interface BudgetCosts {
  flightsOrTrain: number;
  hotel: number;
  cabsAndLocal: number;
  food: number;
  attractions: number;
  shopping: number;
  miscellaneous: number;
}

export const TravelEssentialsAndWeather: React.FC<{
  destination: string;
  darkMode: boolean;
  budgetCosts: BudgetCosts;
  setBudgetCosts: React.Dispatch<React.SetStateAction<BudgetCosts>>;
  targetBudget: number;
  setTargetBudget: (val: number) => void;
  onRegenerateWithBudget: (newBudget: number, tierName: string) => void;
}> = ({
  destination,
  darkMode,
  budgetCosts,
  setBudgetCosts,
  targetBudget,
  setTargetBudget,
  onRegenerateWithBudget,
}) => {
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [checklist, setChecklist] = useState(TRAVEL_ESSENTIALS_DATA.defaultPackingChecklist);
  const [newPackItem, setNewPackItem] = useState('');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<'Budget' | 'Standard' | 'Premium'>(
    'Standard'
  );

  useEffect(() => {
    let active = true;
    const coords = DESTINATION_COORDS[destination] || DESTINATION_COORDS.Goa;
    setLoadingWeather(true);
    fetch(
      `/api/weather?city=${encodeURIComponent(destination)}&lat=${coords.lat}&lng=${coords.lng}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (active) setWeather(data);
      })
      .catch(() => {
        // Fallback handled gracefully
      })
      .finally(() => {
        if (active) setLoadingWeather(false);
      });
    return () => {
      active = false;
    };
  }, [destination]);

  const totalCalculated =
    budgetCosts.flightsOrTrain +
    budgetCosts.hotel +
    budgetCosts.cabsAndLocal +
    budgetCosts.food +
    budgetCosts.attractions +
    budgetCosts.shopping +
    budgetCosts.miscellaneous;

  const applyBudgetPreset = (tier: 'Budget' | 'Standard' | 'Premium') => {
    setSelectedBudgetTier(tier);
    if (tier === 'Budget') {
      const next = {
        flightsOrTrain: 3800,
        hotel: 4500,
        cabsAndLocal: 2200,
        food: 2400,
        attractions: 500,
        shopping: 600,
        miscellaneous: 500,
      };
      setBudgetCosts(next);
      setTargetBudget(14500);
    } else if (tier === 'Standard') {
      const next = {
        flightsOrTrain: 6900,
        hotel: 8550,
        cabsAndLocal: 3800,
        food: 3600,
        attractions: 750,
        shopping: 900,
        miscellaneous: 500,
      };
      setBudgetCosts(next);
      setTargetBudget(25000);
    } else {
      const next = {
        flightsOrTrain: 14800,
        hotel: 26400,
        cabsAndLocal: 6800,
        food: 8500,
        attractions: 2200,
        shopping: 3500,
        miscellaneous: 1800,
      };
      setBudgetCosts(next);
      setTargetBudget(64000);
    }
  };

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddPackItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPackItem.trim();
    if (!trimmed) return;
    setChecklist((prev) => [
      ...prev,
      { id: `pk-${Date.now()}`, label: trimmed, checked: false },
    ]);
    setNewPackItem('');
  };

  const surfaceClass = darkMode
    ? 'bg-slate-900/70 border-slate-800'
    : 'bg-white border-slate-200';

  return (
    <div className="space-y-12">
      {/* ===================================================================
          SECTION 8: TRIP BUDGET CALCULATOR
         =================================================================== */}
      <section className={`p-6 rounded-xl border ${surfaceClass} space-y-6`}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              Interactive Cost Breakdown · Estimated Fares
            </p>
            <h2 className="text-2xl font-semibold tracking-tight mt-1 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              <span>02. Complete Trip Budget Calculator</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Compare three curated budget plans or fine-tune each expense category and regenerate AI recommendations.
            </p>
          </div>

          {/* 3 Budget Plans Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyBudgetPreset('Budget')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                selectedBudgetTier === 'Budget'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              Budget Trip (~₹14,500)
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPreset('Standard')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                selectedBudgetTier === 'Standard'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              Standard Trip (~₹25,000)
            </button>
            <button
              type="button"
              onClick={() => applyBudgetPreset('Premium')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                selectedBudgetTier === 'Premium'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'border-slate-200 dark:border-slate-700 hover:border-teal-600'
              }`}
            >
              Premium Trip (~₹64,000)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sliders / Numeric Inputs */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                { key: 'flightsOrTrain', label: 'Flight / Train Cost (Round-Trip)', max: 40000 },
                { key: 'hotel', label: 'Hotel Accommodation (Total Stay)', max: 50000 },
                { key: 'cabsAndLocal', label: 'Cab & Local Transport Cost', max: 20000 },
                { key: 'food', label: 'Food, Cafes & Dining Cost', max: 25000 },
                { key: 'attractions', label: 'Tourist Attraction Entry Fees', max: 10000 },
                { key: 'shopping', label: 'Shopping & Souvenirs Estimate', max: 20000 },
                { key: 'miscellaneous', label: 'Other / Buffer Expenses', max: 15000 },
              ] as const
            ).map((field) => (
              <div
                key={field.key}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">{field.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    ₹{budgetCosts[field.key].toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={field.max}
                  step={100}
                  value={budgetCosts[field.key]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBudgetCosts((prev) => ({ ...prev, [field.key]: val }));
                  }}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Total Cost Summary Box */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-4">
            <div>
              <span className="text-xs text-slate-500">Estimated Total Trip Cost</span>
              <p className="text-3xl font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400 mt-1">
                ₹{totalCalculated.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                Target Budget Cap: ₹{targetBudget.toLocaleString('en-IN')} ·{' '}
                {totalCalculated <= targetBudget ? 'Within Target Budget' : 'Exceeds Target Cap'}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-500">Transport + Flights:</span>
                <span>
                  ₹{(budgetCosts.flightsOrTrain + budgetCosts.cabsAndLocal).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stay + Dining:</span>
                <span>₹{(budgetCosts.hotel + budgetCosts.food).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Activities + Shopping:</span>
                <span>
                  ₹
                  {(
                    budgetCosts.attractions +
                    budgetCosts.shopping +
                    budgetCosts.miscellaneous
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTargetBudget(totalCalculated);
                onRegenerateWithBudget(totalCalculated, selectedBudgetTier);
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Adjust Budget & Regenerate AI Plan</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 11: DESTINATION WEATHER
         =================================================================== */}
      <section className={`p-6 rounded-xl border ${surfaceClass} space-y-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              {weather?.sourceLabel || 'LIVE DATA · Open-Meteo Meteorological Feed'}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight mt-1 flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <span>03. Destination Weather Forecast ({destination})</span>
            </h2>
          </div>
          {loadingWeather && (
            <span className="text-xs text-slate-500">Refreshing meteorological feed...</span>
          )}
        </div>

        {weather && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Current Condition</span>
                  <p className="text-3xl font-semibold font-mono tabular-nums mt-0.5">
                    {weather.temperature}°C
                  </p>
                  <p className="text-sm font-medium text-teal-700 dark:text-teal-400 mt-0.5">
                    {weather.condition}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono tabular-nums space-y-1">
                  <div className="flex items-center justify-end gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>Rain Prob: {weather.rainProbability}%</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span>Humidity: {weather.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Wind className="w-3.5 h-3.5 text-slate-500" />
                    <span>Wind: {weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  Sunrise: {weather.sunrise}
                </span>
                <span className="flex items-center gap-1.5">
                  <Sunset className="w-4 h-4 text-orange-500" />
                  Sunset: {weather.sunset}
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {weather.daily.slice(0, 4).map((d, idx) => (
                <div
                  key={d.date}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Day {idx + 1} · {d.date.slice(-5)}
                  </p>
                  <p className="text-slate-500 truncate">{d.condition}</p>
                  <p className="text-base font-semibold font-mono tabular-nums text-teal-700 dark:text-teal-400">
                    {d.maxTemp}° / {d.minTemp}°C
                  </p>
                  <p className="text-slate-500 font-mono tabular-nums">Rain: {d.rainProb}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================
          SECTION 10: EVERYTHING YOU NEED BEFORE YOU TRAVEL
         =================================================================== */}
      <section className={`p-6 rounded-xl border ${surfaceClass} space-y-6`}>
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            {TRAVEL_ESSENTIALS_DATA.officialSourceCitation}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" />
            <span>04. Everything You Need Before You Travel</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Emergency Contacts & Facilities */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="text-sm font-semibold">Official Emergency Contacts</h3>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {TRAVEL_ESSENTIALS_DATA.emergencyContacts.map((c) => (
                  <div key={c.label} className="py-2 flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-300">{c.label}</span>
                    <span className="font-mono tabular-nums font-semibold text-teal-700 dark:text-teal-400 shrink-0">
                      {c.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRAVEL_ESSENTIALS_DATA.facilities.map((fac) => (
                <div
                  key={fac.type}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    {fac.type}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {fac.items.map((it) => (
                      <li key={it} className="leading-relaxed">
                        • {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-sm font-semibold">
                Currency, Language, Time Zone & Local Transport
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block">Currency</span>
                  <span className="font-medium">{TRAVEL_ESSENTIALS_DATA.localeMeta.currency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Languages</span>
                  <span className="font-medium">{TRAVEL_ESSENTIALS_DATA.localeMeta.languages}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Time Zone</span>
                  <span className="font-mono tabular-nums font-medium">
                    {TRAVEL_ESSENTIALS_DATA.localeMeta.timeZone}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <strong>Local Transit:</strong> {TRAVEL_ESSENTIALS_DATA.localeMeta.localTransport}
              </p>
            </div>
          </div>

          {/* Interactive Packing Checklist + Local Rules + Required Documents */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Interactive Packing Checklist</h3>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {checklist.filter((c) => c.checked).length}/{checklist.length} packed
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCheck(item.id)}
                    className="w-full flex items-center gap-2.5 text-left text-xs p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {item.checked ? (
                      <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={
                        item.checked
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddPackItem} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newPackItem}
                  onChange={(e) => setNewPackItem(e.target.value)}
                  placeholder="Add custom packing item..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-sm font-semibold">Important Local Rules & Safety</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {TRAVEL_ESSENTIALS_DATA.localRules.map((rule) => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="text-sm font-semibold">Required Travel Documents & Visa Info</h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {TRAVEL_ESSENTIALS_DATA.requiredDocuments.map((docItem) => (
                  <li key={docItem}>• {docItem}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
