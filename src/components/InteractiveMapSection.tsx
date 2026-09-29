import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Navigation, MapPin, Clock, Route as RouteIcon } from 'lucide-react';

export interface MapHubPoint {
  id: string;
  name: string;
  type: 'Hotel' | 'Airport' | 'Railway Station' | 'Attraction' | 'Restaurant' | 'Cab Pickup';
  lat: number;
  lng: number;
  subtitle: string;
}

export const GOA_MAP_POINTS: MapHubPoint[] = [
  {
    id: 'mp-hotel',
    name: 'Casa Fontainhas Heritage Boutique (Your Hotel)',
    type: 'Hotel',
    lat: 15.4962,
    lng: 73.8315,
    subtitle: 'Fontainhas Latin Quarter, Panaji',
  },
  {
    id: 'mp-airport',
    name: 'Goa Dabolim International Airport (GOI)',
    type: 'Airport',
    lat: 15.3803,
    lng: 73.835,
    subtitle: 'Primary Southern/Central Arrival Terminal',
  },
  {
    id: 'mp-mopa',
    name: 'Manohar International Airport Mopa (GOX)',
    type: 'Airport',
    lat: 15.7336,
    lng: 73.8606,
    subtitle: 'Northern Goa Arrival Terminal',
  },
  {
    id: 'mp-rail',
    name: 'Madgaon Junction Railway Station (MAO)',
    type: 'Railway Station',
    lat: 15.2675,
    lng: 73.9701,
    subtitle: 'Konkan Railway Major Hub',
  },
  {
    id: 'mp-fort',
    name: 'Fort Aguada & 17th-Century Lighthouse',
    type: 'Attraction',
    lat: 15.4926,
    lng: 73.7737,
    subtitle: 'Sinquerim Coastal Bastion',
  },
  {
    id: 'mp-basilica',
    name: 'Basilica of Bom Jesus (Old Goa)',
    type: 'Attraction',
    lat: 15.5009,
    lng: 73.9116,
    subtitle: 'UNESCO World Heritage Site',
  },
  {
    id: 'mp-beach',
    name: 'Candolim Beach Promenade',
    type: 'Attraction',
    lat: 15.5181,
    lng: 73.7626,
    subtitle: 'North Goa Shoreline',
  },
  {
    id: 'mp-rest-1',
    name: 'Ritz Classic Coastal Thali House',
    type: 'Restaurant',
    lat: 15.4986,
    lng: 73.8261,
    subtitle: '18th June Road, Panaji',
  },
  {
    id: 'mp-rest-2',
    name: 'Cafe Bodega Courtyard Bakery',
    type: 'Restaurant',
    lat: 15.4934,
    lng: 73.8301,
    subtitle: 'Altinho, Panaji',
  },
  {
    id: 'mp-cab-1',
    name: 'Panaji Ferry & Prepaid Cab Stand',
    type: 'Cab Pickup',
    lat: 15.5011,
    lng: 73.8339,
    subtitle: 'Santa Monica Jetty Pickup Hub',
  },
];

function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return +(R * d * 1.28).toFixed(1); // 1.28 road winding factor fallback
}

interface RouteOverlayProps {
  origin: MapHubPoint;
  destination: MapHubPoint;
  onRouteCalculated: (info: { distanceKm: number; durationMins: number; isLiveRoute: boolean }) => void;
}

interface MapPolylineInstance {
  setMap: (map: unknown) => void;
}

const RouteCalculatorController: React.FC<RouteOverlayProps> = ({
  origin,
  destination,
  onRouteCalculated,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes') as unknown as {
    Route?: {
      computeRoutes: (req: Record<string, unknown>) => Promise<{
        routes?: Array<{
          distanceMeters?: number;
          durationMillis?: number;
          createPolylines?: () => MapPolylineInstance[];
        }>;
      }>;
    };
  } | null;

  useEffect(() => {
    if (!map) return;

    let polylines: MapPolylineInstance[] = [];
    let cancelled = false;

    async function runRoute() {
      if (routesLib?.Route?.computeRoutes) {
        try {
          // Recommended modern replacement for DirectionsService: Route.computeRoutes()
          // Doc: https://developers.google.com/maps/documentation/javascript/routes?utm_campaign=gmp_mcp_codeassist_v1_aistudio
          const res = await routesLib.Route.computeRoutes({
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: 'DRIVING',
            fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
          });

          if (cancelled) return;
          const route = res?.routes?.[0];
          if (route) {
            const distKm = route.distanceMeters ? +(route.distanceMeters / 1000).toFixed(1) : haversineDistanceKm(origin, destination);
            const durMins = route.durationMillis ? Math.max(5, Math.round(route.durationMillis / 60000)) : Math.round(distKm * 2.1);

            onRouteCalculated({
              distanceKm: distKm,
              durationMins: durMins,
              isLiveRoute: true,
            });

            if (typeof route.createPolylines === 'function') {
              polylines = route.createPolylines();
              polylines.forEach((p) => p.setMap(map));
            }
            return;
          }
        } catch (err: unknown) {
          const msg = String(err);
          if (
            msg.includes('429') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('OVER_QUERY_LIMIT') ||
            msg.includes('Quota')
          ) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        }
      }

      if (!cancelled) {
        const fallbackKm = haversineDistanceKm(origin, destination);
        onRouteCalculated({
          distanceKm: fallbackKm,
          durationMins: Math.max(6, Math.round(fallbackKm * 2.1)),
          isLiveRoute: false,
        });
      }
    }

    runRoute();

    return () => {
      cancelled = true;
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, routesLib, origin, destination]);

  return null;
};

export const InteractiveMapSection: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [fromId, setFromId] = useState<string>('mp-hotel');
  const [toId, setToId] = useState<string>('mp-fort');
  const [activePoint, setActivePoint] = useState<MapHubPoint>(GOA_MAP_POINTS[0]);
  const [routeMetrics, setRouteMetrics] = useState<{
    distanceKm: number;
    durationMins: number;
    isLiveRoute: boolean;
  }>({
    distanceKm: 6.5,
    durationMins: 18,
    isLiveRoute: false,
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const originPoint = GOA_MAP_POINTS.find((p) => p.id === fromId) || GOA_MAP_POINTS[0];
  const destPoint = GOA_MAP_POINTS.find((p) => p.id === toId) || GOA_MAP_POINTS[4];

  const categories = ['All', 'Hotel', 'Airport', 'Railway Station', 'Attraction', 'Restaurant', 'Cab Pickup'];
  const visiblePoints =
    selectedCategory === 'All'
      ? GOA_MAP_POINTS
      : GOA_MAP_POINTS.filter((p) => p.type === selectedCategory);

  const markerColorByType = (type: MapHubPoint['type']) => {
    switch (type) {
      case 'Hotel':
        return 'bg-teal-700 text-white border-white';
      case 'Airport':
        return 'bg-sky-700 text-white border-white';
      case 'Railway Station':
        return 'bg-indigo-700 text-white border-white';
      case 'Attraction':
        return 'bg-amber-600 text-white border-white';
      case 'Restaurant':
        return 'bg-emerald-700 text-white border-white';
      case 'Cab Pickup':
        return 'bg-slate-800 text-white border-white';
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Interactive Spatial Hub · Google Maps Platform
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
            01. Destination Map & Route Distance Calculator
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Inspect your hotel, airports, railway station, tourist attractions, restaurants, and cab pickup points, or calculate route distance and estimated travel time.
          </p>
        </div>

        {/* Category Segmented Filter */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Route Calculator Bar */}
      <div
        className={`p-5 rounded-xl border ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        } grid grid-cols-1 md:grid-cols-12 gap-4 items-center`}
      >
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Origin Point
          </label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {GOA_MAP_POINTS.map((pt) => (
              <option key={pt.id} value={pt.id}>
                [{pt.type}] {pt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Destination Point
          </label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {GOA_MAP_POINTS.map((pt) => (
              <option key={pt.id} value={pt.id}>
                [{pt.type}] {pt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <RouteIcon className="w-3.5 h-3.5 text-teal-600" />
              {routeMetrics.isLiveRoute ? 'LIVE DATA · Google Routes SDK' : 'ESTIMATED ROAD DISTANCE'}
            </span>
          </div>
          <div className="flex items-baseline gap-4 mt-1 font-mono tabular-nums">
            <div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">
                {routeMetrics.distanceKm} km
              </span>
              <span className="text-xs text-slate-500 ml-1">distance</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xl font-semibold text-teal-700 dark:text-teal-400">
                ~{routeMetrics.durationMins} mins
              </span>
              <span className="text-xs text-slate-500 ml-1">by cab</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Viewport + Location Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-[460px] relative bg-slate-100 dark:bg-slate-900">
          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <Map
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                defaultCenter={{ lat: 15.4962, lng: 73.8315 }}
                defaultZoom={11}
                gestureHandling="greedy"
                className="w-full h-full"
              >
                <RouteCalculatorController
                  origin={originPoint}
                  destination={destPoint}
                  onRouteCalculated={setRouteMetrics}
                />
                {visiblePoints.map((pt) => (
                  <AdvancedMarker
                    key={pt.id}
                    position={{ lat: pt.lat, lng: pt.lng }}
                    onClick={() => setActivePoint(pt)}
                  >
                    <div
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm cursor-pointer transition-transform hover:scale-105 ${markerColorByType(
                        pt.type
                      )}`}
                    >
                      {pt.type}: {pt.name.split(' ')[0]}
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="w-8 h-8 text-teal-600 mb-2" />
              <p className="text-sm font-semibold">Interactive Map Ready</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Select any pin in the directory on the right to calculate distance and cab travel time between Goa hubs.
              </p>
            </div>
          )}
        </div>

        {/* Directory Sidebar */}
        <div
          className={`lg:col-span-4 rounded-xl border p-4 flex flex-col justify-between h-[460px] overflow-y-auto ${
            darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3">
            <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold">Mapped Trip Locations ({visiblePoints.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any location to set it as your destination from the hotel.
              </p>
            </div>

            <div className="space-y-2">
              {visiblePoints.map((pt) => {
                const isSelected = activePoint.id === pt.id || toId === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => {
                      setActivePoint(pt);
                      if (pt.id !== fromId) {
                        setToId(pt.id);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{pt.type}</span>
                      <span className="font-mono tabular-nums">
                        {pt.lat.toFixed(3)}, {pt.lng.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {pt.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pt.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              Selected: {activePoint.name.slice(0, 28)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
