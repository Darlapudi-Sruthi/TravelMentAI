import heroCoastlineImg from '../assets/images/hero_goa_coastline_1790695628303.jpg';
import hotelLuxuryImg from '../assets/images/hotel_luxury_resort_1790695642990.jpg';
import hotelBoutiqueImg from '../assets/images/hotel_midrange_boutique_1790695660761.jpg';
import attractionFortImg from '../assets/images/attraction_heritage_fort_1790695673741.jpg';
import foodCoastalImg from '../assets/images/food_coastal_thali_1790695690008.jpg';

export const ASSETS = {
  heroCoastline: heroCoastlineImg,
  hotelLuxury: hotelLuxuryImg,
  hotelBoutique: hotelBoutiqueImg,
  attractionFort: attractionFortImg,
  foodCoastal: foodCoastalImg,
};

export type TripType = 'Solo' | 'Family' | 'Friends' | 'Couple' | 'Business';

export interface FlightItem {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  departureHour: number;
  arrivalTime: string;
  durationMinutes: number;
  durationLabel: string;
  stops: number;
  stopsLabel: string;
  cabinClass: 'Economy' | 'Business';
  baggage: string;
  price: number;
  seatsEstimated: string;
  isDemoData: boolean;
}

export interface HotelItem {
  id: string;
  name: string;
  category: 'Budget' | 'Mid-Range' | 'Premium/Luxury';
  location: string;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  availableRoomsEstimate: number;
  amenities: string[];
  breakfastIncluded: boolean;
  distanceFromCenterKm: number;
  distanceLabel: string;
  cancellationPolicy: string;
  image: string;
  lat: number;
  lng: number;
}

export interface CabOption {
  id: string;
  routeType:
    | 'Airport → Hotel'
    | 'Hotel → Tourist attractions'
    | 'Hotel → Railway station'
    | 'Hotel → Airport'
    | 'Local city rides';
  cabCategory: 'Economy' | 'Sedan' | 'SUV' | 'Premium' | 'Auto/Rickshaw' | 'Rental Car';
  vehicleName: string;
  seats: number;
  estimatedFare: number;
  estimatedTimeMinutes: number;
  distanceKm: number;
  pickupLocation: string;
  dropLocation: string;
  availabilityLabel: string;
}

export interface RestaurantItem {
  id: string;
  name: string;
  category: 'Restaurant' | 'Cafe' | 'Street Food' | 'Local Speciality' | 'Family Restaurant';
  dietary: 'Vegetarian' | 'Non-Vegetarian' | 'Veg & Non-Veg';
  isBudget: boolean;
  isFamilyFriendly: boolean;
  isLocalFood: boolean;
  rating: number;
  costPerPerson: number;
  location: string;
  openingHours: string;
  popularDishes: string[];
  distanceFromHotelKm: number;
  openStatusLabel: string;
  image: string;
  lat: number;
  lng: number;
}

export interface TouristPlaceItem {
  id: string;
  name: string;
  category:
    | 'Popular Attraction'
    | 'Historical'
    | 'Nature'
    | 'Beach'
    | 'Museum'
    | 'Religious/Temple'
    | 'Shopping'
    | 'Entertainment'
    | 'Hidden Gem';
  description: string;
  location: string;
  openingHours: string;
  entryFee: number;
  entryFeeLabel: string;
  visitingTimeHours: string;
  distanceFromHotelKm: number;
  bestTimeToVisit: string;
  image: string;
  lat: number;
  lng: number;
}

export interface AIItinerarySlot {
  time: string;
  title: string;
  category: string;
  details: string;
  distanceAndTravelTime: string;
  openingHours: string;
  estimatedCost: number;
}

export interface AIItineraryDay {
  dayNumber: number;
  theme: string;
  dailyCostEstimate: number;
  slots: AIItinerarySlot[];
}

export interface AITripPlan {
  tripTitle: string;
  summary: string;
  recommendedTier: string;
  recommendedHotelArea: string;
  recommendedTransportNote: string;
  budgetBreakdown: {
    flightsOrTrain: number;
    hotel: number;
    cabsAndLocal: number;
    food: number;
    attractions: number;
    shopping: number;
    miscellaneous: number;
    totalEstimated: number;
  };
  days: AIItineraryDay[];
  smartTips: string[];
}

export const DESTINATION_COORDS: Record<string, { lat: number; lng: number; state: string }> = {
  Goa: { lat: 15.4909, lng: 73.8278, state: 'Goa, India' },
  Manali: { lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh, India' },
  Jaipur: { lat: 26.9124, lng: 75.7873, state: 'Rajasthan, India' },
  Kerala: { lat: 9.9312, lng: 76.2673, state: 'Kerala, India' },
  Pondicherry: { lat: 11.9416, lng: 79.8083, state: 'Puducherry, India' },
};

export const SAMPLE_FLIGHTS: FlightItem[] = [
  {
    id: 'fl-1',
    airline: 'IndiGo',
    flightNumber: '6E-724',
    from: 'Hyderabad (HYD)',
    to: 'Goa Mopa (GOX)',
    departureTime: '06:45',
    departureHour: 6,
    arrivalTime: '08:05',
    durationMinutes: 80,
    durationLabel: '1h 20m',
    stops: 0,
    stopsLabel: 'Non-stop',
    cabinClass: 'Economy',
    baggage: '15 kg Check-in · 7 kg Cabin',
    price: 3450,
    seatsEstimated: 'Demo Schedule · Typically 9+ seats',
    isDemoData: true,
  },
  {
    id: 'fl-2',
    airline: 'Air India Express',
    flightNumber: 'IX-918',
    from: 'Hyderabad (HYD)',
    to: 'Goa Dabolim (GOI)',
    departureTime: '09:30',
    departureHour: 9,
    arrivalTime: '10:55',
    durationMinutes: 85,
    durationLabel: '1h 25m',
    stops: 0,
    stopsLabel: 'Non-stop',
    cabinClass: 'Economy',
    baggage: '15 kg Check-in · 7 kg Cabin',
    price: 3890,
    seatsEstimated: 'Demo Schedule · Typically 6+ seats',
    isDemoData: true,
  },
  {
    id: 'fl-3',
    airline: 'Akasa Air',
    flightNumber: 'QP-1412',
    from: 'Hyderabad (HYD)',
    to: 'Goa Mopa (GOX)',
    departureTime: '13:15',
    departureHour: 13,
    arrivalTime: '14:40',
    durationMinutes: 85,
    durationLabel: '1h 25m',
    stops: 0,
    stopsLabel: 'Non-stop',
    cabinClass: 'Economy',
    baggage: '15 kg Check-in · 7 kg Cabin',
    price: 3290,
    seatsEstimated: 'Demo Schedule · Best Value Fare',
    isDemoData: true,
  },
  {
    id: 'fl-4',
    airline: 'Air India',
    flightNumber: 'AI-562',
    from: 'Hyderabad (HYD)',
    to: 'Goa Dabolim (GOI)',
    departureTime: '16:20',
    departureHour: 16,
    arrivalTime: '19:35',
    durationMinutes: 195,
    durationLabel: '3h 15m',
    stops: 1,
    stopsLabel: '1 Stop (BOM)',
    cabinClass: 'Economy',
    baggage: '20 kg Check-in · 8 kg Cabin',
    price: 4650,
    seatsEstimated: 'Demo Schedule · Hot Meal Included',
    isDemoData: true,
  },
  {
    id: 'fl-5',
    airline: 'Air India',
    flightNumber: 'AI-845',
    from: 'Hyderabad (HYD)',
    to: 'Goa Dabolim (GOI)',
    departureTime: '10:10',
    departureHour: 10,
    arrivalTime: '11:35',
    durationMinutes: 85,
    durationLabel: '1h 25m',
    stops: 0,
    stopsLabel: 'Non-stop',
    cabinClass: 'Business',
    baggage: '35 kg Check-in · 12 kg Cabin · Lounge Access',
    price: 12400,
    seatsEstimated: 'Demo Schedule · Priority Boarding',
    isDemoData: true,
  },
];

export const SAMPLE_HOTELS: HotelItem[] = [
  {
    id: 'ht-1',
    name: 'Zostel & Palm Stay Hostel Candolim',
    category: 'Budget',
    location: 'Candolim Beach Road, North Goa',
    rating: 4.3,
    reviewsCount: 640,
    pricePerNight: 1250,
    availableRoomsEstimate: 6,
    amenities: ['Free Wi-Fi', 'AC Rooms', '24h Front Desk', 'Locker Storage', 'Scooter Parking'],
    breakfastIncluded: false,
    distanceFromCenterKm: 0.6,
    distanceLabel: '0.6 km from Candolim Beach',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    image: ASSETS.hotelBoutique,
    lat: 15.5181,
    lng: 73.7626,
  },
  {
    id: 'ht-2',
    name: 'Sea Breeze Backpackers & Guesthouse',
    category: 'Budget',
    location: 'Palolem Coastal Lane, South Goa',
    rating: 4.2,
    reviewsCount: 410,
    pricePerNight: 1450,
    availableRoomsEstimate: 4,
    amenities: ['Free Wi-Fi', 'AC Rooms', 'Garden Patio', 'Filtered Water'],
    breakfastIncluded: true,
    distanceFromCenterKm: 0.4,
    distanceLabel: '0.4 km from Palolem Beach',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    image: ASSETS.hotelBoutique,
    lat: 15.01,
    lng: 74.0232,
  },
  {
    id: 'ht-3',
    name: 'Casa Fontainhas Heritage Boutique',
    category: 'Mid-Range',
    location: 'Fontainhas Latin Quarter, Panaji',
    rating: 4.7,
    reviewsCount: 890,
    pricePerNight: 3200,
    availableRoomsEstimate: 5,
    amenities: [
      'Complimentary Goan Breakfast',
      'Courtyard Plunge Pool',
      'High-Speed Wi-Fi',
      'Heritage Balcony',
      'Airport Transfer Desk',
    ],
    breakfastIncluded: true,
    distanceFromCenterKm: 0.3,
    distanceLabel: '0.3 km from Panaji Heritage Walk',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    image: ASSETS.hotelBoutique,
    lat: 15.4962,
    lng: 73.8315,
  },
  {
    id: 'ht-4',
    name: 'Baga Creek Courtyard Resort',
    category: 'Mid-Range',
    location: 'Arpora-Baga Lagoon Road, North Goa',
    rating: 4.5,
    reviewsCount: 1120,
    pricePerNight: 2850,
    availableRoomsEstimate: 8,
    amenities: ['Buffet Breakfast', 'Swimming Pool', 'Multi-Cuisine Cafe', 'Free Parking', 'Wi-Fi'],
    breakfastIncluded: true,
    distanceFromCenterKm: 1.1,
    distanceLabel: '1.1 km from Baga Beach',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    image: ASSETS.hotelBoutique,
    lat: 15.5553,
    lng: 73.7517,
  },
  {
    id: 'ht-5',
    name: 'Taj Aguada Horizon Oceanfront Resort & Spa',
    category: 'Premium/Luxury',
    location: 'Sinquerim Cliffside, North Goa',
    rating: 4.9,
    reviewsCount: 2340,
    pricePerNight: 9800,
    availableRoomsEstimate: 3,
    amenities: [
      'Infinity Ocean Pool',
      '24/7 Room Service',
      'Fine Dining Seafood Restaurant',
      'Jiva Wellness Spa',
      'Private Beach Access',
    ],
    breakfastIncluded: true,
    distanceFromCenterKm: 0.5,
    distanceLabel: '0.5 km from Fort Aguada Ramparts',
    cancellationPolicy: 'Flexible refund up to 72 hours prior to arrival',
    image: ASSETS.hotelLuxury,
    lat: 15.4989,
    lng: 73.7679,
  },
  {
    id: 'ht-6',
    name: 'Alila Diwa Coastal Sanctuary',
    category: 'Premium/Luxury',
    location: 'Majorda Paddy & Beach Belt, South Goa',
    rating: 4.8,
    reviewsCount: 1580,
    pricePerNight: 8400,
    availableRoomsEstimate: 4,
    amenities: [
      'Infinity Lap Pool',
      'Gourmet Coastal Restaurant',
      '24/7 Butler & Room Service',
      'Beach Shuttle',
      'Kids Club',
    ],
    breakfastIncluded: true,
    distanceFromCenterKm: 0.7,
    distanceLabel: '0.7 km from Majorda Beach',
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    image: ASSETS.hotelLuxury,
    lat: 15.3056,
    lng: 73.9092,
  },
];

export const SAMPLE_CABS: CabOption[] = [
  {
    id: 'cab-1',
    routeType: 'Airport → Hotel',
    cabCategory: 'Sedan',
    vehicleName: 'Swift Dzire / Etios AC',
    seats: 4,
    estimatedFare: 1100,
    estimatedTimeMinutes: 50,
    distanceKm: 32,
    pickupLocation: 'Goa Airport (GOX / GOI) Prepaid Counter',
    dropLocation: 'Panaji / Candolim Hotel Zone',
    availabilityLabel: 'Estimated Fare · Goa Miles / Prepaid Taxi',
  },
  {
    id: 'cab-2',
    routeType: 'Airport → Hotel',
    cabCategory: 'SUV',
    vehicleName: 'Toyota Innova Crysta AC',
    seats: 6,
    estimatedFare: 1650,
    estimatedTimeMinutes: 50,
    distanceKm: 32,
    pickupLocation: 'Goa Airport Arrival Gate 2',
    dropLocation: 'North / South Goa Resort Hub',
    availabilityLabel: 'Estimated Fare · Family Luggage Friendly',
  },
  {
    id: 'cab-3',
    routeType: 'Hotel → Tourist attractions',
    cabCategory: 'Economy',
    vehicleName: 'WagonR / Celerio AC Hatchback',
    seats: 4,
    estimatedFare: 1800,
    estimatedTimeMinutes: 480,
    distanceKm: 80,
    pickupLocation: 'Your Hotel Lobby',
    dropLocation: '8-Hour North Goa Sightseeing Circuit',
    availabilityLabel: 'Estimated Full-Day Charter (8 hrs / 80 km)',
  },
  {
    id: 'cab-4',
    routeType: 'Hotel → Tourist attractions',
    cabCategory: 'Rental Car',
    vehicleName: 'Self-Drive Baleno / Automatic Hatchback',
    seats: 5,
    estimatedFare: 1350,
    estimatedTimeMinutes: 1440,
    distanceKm: 150,
    pickupLocation: 'Panaji / Calangute Hub Delivery',
    dropLocation: '24-Hour Self-Drive Rental',
    availabilityLabel: 'Estimated Daily Rate · Valid Driving License Req.',
  },
  {
    id: 'cab-5',
    routeType: 'Hotel → Railway station',
    cabCategory: 'Sedan',
    vehicleName: 'AC Sedan Point-to-Point',
    seats: 4,
    estimatedFare: 850,
    estimatedTimeMinutes: 40,
    distanceKm: 24,
    pickupLocation: 'Candolim / Panaji Hotel',
    dropLocation: 'Madgaon (MAO) / Thivim (THVM) Railway Station',
    availabilityLabel: 'Estimated Fare · Pre-book 3 hrs prior',
  },
  {
    id: 'cab-6',
    routeType: 'Hotel → Airport',
    cabCategory: 'Premium',
    vehicleName: 'Toyota Camry / Executive SUV',
    seats: 4,
    estimatedFare: 2200,
    estimatedTimeMinutes: 45,
    distanceKm: 32,
    pickupLocation: 'Hotel Main Porch',
    dropLocation: 'Goa Airport Departure Terminal',
    availabilityLabel: 'Estimated Fare · Chauffeur Assisted',
  },
  {
    id: 'cab-7',
    routeType: 'Local city rides',
    cabCategory: 'Auto/Rickshaw',
    vehicleName: 'Local Metered Auto / Motorcycle Pilot',
    seats: 3,
    estimatedFare: 180,
    estimatedTimeMinutes: 15,
    distanceKm: 5,
    pickupLocation: 'Panaji Market / Beach Stand',
    dropLocation: 'Nearby Cafe or Ferry Jetty (5 km radius)',
    availabilityLabel: 'Estimated Short Hop · Day Rates',
  },
];

export const SAMPLE_RESTAURANTS: RestaurantItem[] = [
  {
    id: 'fd-1',
    name: 'Ritz Classic Coastal Thali House',
    category: 'Local Speciality',
    dietary: 'Veg & Non-Veg',
    isBudget: false,
    isFamilyFriendly: true,
    isLocalFood: true,
    rating: 4.7,
    costPerPerson: 480,
    location: '18th June Road, Panaji',
    openingHours: '12:00 PM – 03:45 PM, 07:00 PM – 10:45 PM',
    popularDishes: ['Goan Kingfish Thali', 'Solkadhi', 'Prawn Balchão', 'Vegetable Khatkhate'],
    distanceFromHotelKm: 0.8,
    openStatusLabel: 'Demo Hours · Peak Lunch 12:30 PM – 2:30 PM',
    image: ASSETS.foodCoastal,
    lat: 15.4986,
    lng: 73.8261,
  },
  {
    id: 'fd-2',
    name: 'Cafe Bodega Courtyard Bakery',
    category: 'Cafe',
    dietary: 'Vegetarian',
    isBudget: false,
    isFamilyFriendly: true,
    isLocalFood: false,
    rating: 4.6,
    costPerPerson: 420,
    location: 'Sunaparanta Art Centre, Altinho, Panaji',
    openingHours: '10:00 AM – 07:00 PM',
    popularDishes: ['Artisanal Sourdough Toast', 'Goan Poi Sandwiches', 'Cold Brew', 'Bebinca Tart'],
    distanceFromHotelKm: 1.2,
    openStatusLabel: 'Demo Hours · Daytime Courtyard Cafe',
    image: ASSETS.foodCoastal,
    lat: 15.4934,
    lng: 73.8301,
  },
  {
    id: 'fd-3',
    name: 'Navtara Pure Veg Udupi & Goan Dining',
    category: 'Family Restaurant',
    dietary: 'Vegetarian',
    isBudget: true,
    isFamilyFriendly: true,
    isLocalFood: true,
    rating: 4.4,
    costPerPerson: 220,
    location: 'Near Municipal Garden, Panaji & Calangute',
    openingHours: '07:30 AM – 10:30 PM',
    popularDishes: ['Goan Mushroom Xacuti', 'Paneer Cafreal', 'Ghee Roast Dosa', 'Filter Coffee'],
    distanceFromHotelKm: 0.6,
    openStatusLabel: 'Demo Hours · All-Day Pure Vegetarian',
    image: ASSETS.foodCoastal,
    lat: 15.4979,
    lng: 73.825,
  },
  {
    id: 'fd-4',
    name: 'Miramar Evening Street Food & Poi Stalls',
    category: 'Street Food',
    dietary: 'Veg & Non-Veg',
    isBudget: true,
    isFamilyFriendly: true,
    isLocalFood: true,
    rating: 4.5,
    costPerPerson: 150,
    location: 'Miramar Beach Promenade, Panaji',
    openingHours: '04:30 PM – 10:00 PM',
    popularDishes: ['Ros Omelette with Warm Poi', 'Mirchi Bhaji', 'Chana Ros', 'Caramel Pudding'],
    distanceFromHotelKm: 2.8,
    openStatusLabel: 'Demo Hours · Best at Sunset',
    image: ASSETS.foodCoastal,
    lat: 15.4822,
    lng: 73.8072,
  },
  {
    id: 'fd-5',
    name: 'Fisherman’s Wharf Riverside',
    category: 'Restaurant',
    dietary: 'Non-Vegetarian',
    isBudget: false,
    isFamilyFriendly: true,
    isLocalFood: true,
    rating: 4.8,
    costPerPerson: 950,
    location: 'Sal Riverfront / Candolim',
    openingHours: '12:00 PM – 11:30 PM',
    popularDishes: ['Pomfret Recheado', 'Goan Prawn Curry Rice', 'Bebinca with Ice Cream'],
    distanceFromHotelKm: 3.4,
    openStatusLabel: 'Demo Hours · Live Evening Acoustic Music',
    image: ASSETS.foodCoastal,
    lat: 15.5128,
    lng: 73.7689,
  },
];

export const SAMPLE_PLACES: TouristPlaceItem[] = [
  {
    id: 'pl-1',
    name: 'Fort Aguada & 17th-Century Lighthouse',
    category: 'Historical',
    description:
      'Well-preserved 1612 Portuguese laterite fort overlooking the confluence of the Mandovi River and Arabian Sea, featuring an iconic four-storey lighthouse and bastion ramparts.',
    location: 'Sinquerim, North Goa',
    openingHours: '09:30 AM – 06:00 PM',
    entryFee: 0,
    entryFeeLabel: 'Free Entry (Lower Jail Museum ₹50)',
    visitingTimeHours: '1.5 – 2 hours',
    distanceFromHotelKm: 6.5,
    bestTimeToVisit: '04:00 PM – 06:00 PM (Golden Hour Sunset)',
    image: ASSETS.attractionFort,
    lat: 15.4926,
    lng: 73.7737,
  },
  {
    id: 'pl-2',
    name: 'Fontainhas Latin Quarter & St. Sebastian Chapel',
    category: 'Popular Attraction',
    description:
      'UNESCO-recognized heritage quarter with pastel ochre, indigo, and terracotta Portuguese villas, hand-painted azulejos tiles, art galleries, and traditional bakeries.',
    location: 'Altinho-Mala, Panaji',
    openingHours: 'Open 24 Hours (Respect residential quiet hours)',
    entryFee: 0,
    entryFeeLabel: 'Free Walking Exploration',
    visitingTimeHours: '2 hours',
    distanceFromHotelKm: 0.4,
    bestTimeToVisit: '08:30 AM – 10:30 AM or 04:30 PM',
    image: ASSETS.hotelBoutique,
    lat: 15.4962,
    lng: 73.8315,
  },
  {
    id: 'pl-3',
    name: 'Basilica of Bom Jesus & Se Cathedral',
    category: 'Religious/Temple',
    description:
      '16th-century UNESCO World Heritage baroque basilica built in red laterite stone, alongside the grand Se Cathedral and Shri Mangueshi Temple circuit nearby.',
    location: 'Old Goa (Velha Goa)',
    openingHours: '09:00 AM – 06:30 PM (Sundays from 10:30 AM)',
    entryFee: 0,
    entryFeeLabel: 'Free Entry (Archaeological Museum ₹25)',
    visitingTimeHours: '2 – 2.5 hours',
    distanceFromHotelKm: 9.8,
    bestTimeToVisit: '09:30 AM – 12:00 PM',
    image: ASSETS.attractionFort,
    lat: 15.5009,
    lng: 73.9116,
  },
  {
    id: 'pl-4',
    name: 'Candolim & Sinquerim Coastal Promenade',
    category: 'Beach',
    description:
      'Expansive golden sand shoreline with calm swimmable Arabian Sea waters, regulated lifeguards, water sports desks, and relaxed beachfront shacks.',
    location: 'Candolim, North Goa',
    openingHours: '06:00 AM – 10:00 PM (Lifeguards 08:00 AM – 06:00 PM)',
    entryFee: 0,
    entryFeeLabel: 'Free Public Beach',
    visitingTimeHours: '2 – 3 hours',
    distanceFromHotelKm: 4.8,
    bestTimeToVisit: 'Early Morning or 04:30 PM – Sunset',
    image: ASSETS.heroCoastline,
    lat: 15.5181,
    lng: 73.7626,
  },
  {
    id: 'pl-5',
    name: 'Museum of Christian Art &Houses of Goa Museum',
    category: 'Museum',
    description:
      'Curated architectural and Indo-Portuguese cultural museums showcasing centuries of craftsmanship, ship-shaped architecture by Gerard da Cunha, and coastal history.',
    location: 'Old Goa & Porvorim Torda',
    openingHours: '10:00 AM – 05:30 PM (Closed Mondays)',
    entryFee: 150,
    entryFeeLabel: '₹150 per adult',
    visitingTimeHours: '1.5 hours',
    distanceFromHotelKm: 5.2,
    bestTimeToVisit: '11:00 AM – 03:30 PM (Indoor AC/Shaded)',
    image: ASSETS.hotelBoutique,
    lat: 15.5249,
    lng: 73.8162,
  },
  {
    id: 'pl-6',
    name: 'Divar Island Ferry & Mangrove Backwaters',
    category: 'Hidden Gem',
    description:
      'Serene river island reached via a free 5-minute roll-on ferry from Old Goa, featuring quiet paddy fields, hilltop Our Lady of Compassion viewpoint, and zero commercial crowds.',
    location: 'Divar Island, Mandovi River',
    openingHours: 'Ferry runs 06:30 AM – 09:00 PM every 15 mins',
    entryFee: 0,
    entryFeeLabel: 'Free Passenger Ferry (₹10 Two-Wheeler)',
    visitingTimeHours: '2.5 hours',
    distanceFromHotelKm: 10.5,
    bestTimeToVisit: '07:30 AM – 10:30 AM or Late Afternoon',
    image: ASSETS.heroCoastline,
    lat: 15.5256,
    lng: 73.9032,
  },
  {
    id: 'pl-7',
    name: 'Panaji Municipal Market & Azulejos Artisans',
    category: 'Shopping',
    description:
      'Bustling local market for authentic Goan cashews, kokum syrup, hand-painted ceramic tiles, kunbi cotton weaves, and traditional spice blends.',
    location: 'Inox / Market Road, Panaji',
    openingHours: '09:00 AM – 08:30 PM',
    entryFee: 0,
    entryFeeLabel: 'Free Entry',
    visitingTimeHours: '1.5 hours',
    distanceFromHotelKm: 1.0,
    bestTimeToVisit: '04:00 PM – 07:30 PM',
    image: ASSETS.foodCoastal,
    lat: 15.4988,
    lng: 73.8221,
  },
  {
    id: 'pl-8',
    name: 'Salim Ali Bird Sanctuary & Chorao Mangrove Trail',
    category: 'Nature',
    description:
      'Estuarine mangrove forest along the Mandovi River home to kingfishers, mudskippers, and migratory coastal birds with guided canoe and boardwalk trails.',
    location: 'Chorao Island Ferry Point, Ribandar',
    openingHours: '06:00 AM – 05:30 PM',
    entryFee: 100,
    entryFeeLabel: '₹100 Forest Entry',
    visitingTimeHours: '2 hours',
    distanceFromHotelKm: 4.5,
    bestTimeToVisit: '06:30 AM – 09:30 AM',
    image: ASSETS.heroCoastline,
    lat: 15.5122,
    lng: 73.8689,
  },
  {
    id: 'pl-9',
    name: 'Mandovi Sunset Cultural River Cruise',
    category: 'Entertainment',
    description:
      '1-hour evening river cruise from Santa Monica Jetty featuring traditional Dekhni and Fugdi folk dances, live Goan mandos music, and illuminated bridge views.',
    location: 'Santa Monica Jetty, Panaji',
    openingHours: 'Departures at 05:30 PM, 06:45 PM, 08:00 PM',
    entryFee: 500,
    entryFeeLabel: '₹500 per person',
    visitingTimeHours: '1 hour',
    distanceFromHotelKm: 1.3,
    bestTimeToVisit: '05:30 PM Sunset Departure',
    image: ASSETS.hotelLuxury,
    lat: 15.5011,
    lng: 73.8339,
  },
];

export const DEFAULT_AI_TRIP_PLAN: AITripPlan = {
  tripTitle: 'Hyderabad to Goa · 4-Day Coastal Heritage & Culinary Plan',
  summary:
    'A balanced 4-day itinerary from Hyderabad to Goa designed around a ₹25,000 target budget, combining non-stop flight/train connectivity, Panaji Latin Quarter boutique stays, Fort Aguada & Old Goa heritage, Divar Island backwaters, and authentic coastal dining.',
  recommendedTier: 'Standard',
  recommendedHotelArea: 'Panaji Fontainhas / Candolim Central Belt (minimizes North & Old Goa transit time)',
  recommendedTransportNote:
    'Use Goa Miles app or prepaid counter for airport transfers (₹1,100), and local AC cab or self-drive/two-wheeler rental for daily sightseeing.',
  budgetBreakdown: {
    flightsOrTrain: 6900,
    hotel: 8550,
    cabsAndLocal: 3800,
    food: 3600,
    attractions: 750,
    shopping: 900,
    miscellaneous: 500,
    totalEstimated: 25000,
  },
  days: [
    {
      dayNumber: 1,
      theme: 'Arrival in Goa, Latin Quarter Walk & Sunset River Cruise',
      dailyCostEstimate: 5400,
      slots: [
        {
          time: '08:05 AM',
          title: 'Arrive at Goa Airport (GOX/GOI) & Prepaid Cab Transfer',
          category: 'Transport',
          details: 'Morning arrival from Hyderabad (6E-724). Board prepaid AC sedan to Panaji / Candolim hotel.',
          distanceAndTravelTime: '32 km · 50 mins drive',
          openingHours: '24/7 Prepaid Taxi Counter',
          estimatedCost: 1100,
        },
        {
          time: '10:30 AM',
          title: 'Hotel Check-In & Refresh at Boutique Courtyard Stay',
          category: 'Hotel',
          details: 'Early bag drop / check-in, welcome kokum refresher, and settle into your room.',
          distanceAndTravelTime: '0 km · At Hotel Hub',
          openingHours: 'Standard check-in 12:00 PM',
          estimatedCost: 2850,
        },
        {
          time: '01:00 PM',
          title: 'Traditional Coastal Thali Lunch at Ritz Classic',
          category: 'Food',
          details: 'Savor authentic Goan fish or pure veg khatkhate thali with solkadhi.',
          distanceAndTravelTime: '0.8 km · 5 mins from hotel',
          openingHours: '12:00 PM – 03:45 PM',
          estimatedCost: 480,
        },
        {
          time: '04:00 PM',
          title: 'Fontainhas Heritage Quarter & Sunset Mandovi Cruise',
          category: 'Attraction',
          details: 'Stroll pastel Portuguese lanes in Fontainhas, followed by the 5:30 PM Santa Monica Jetty folk cruise.',
          distanceAndTravelTime: '1.3 km · 8 mins walk/auto',
          openingHours: 'Cruise departs 05:30 PM',
          estimatedCost: 500,
        },
        {
          time: '08:00 PM',
          title: 'Evening Promenade Dinner at Miramar Beach Stalls',
          category: 'Food',
          details: 'Enjoy warm Goan poi, ros omelette or chana ros, and coastal breeze along Miramar beach.',
          distanceAndTravelTime: '2.8 km · 10 mins cab',
          openingHours: '04:30 PM – 10:00 PM',
          estimatedCost: 470,
        },
      ],
    },
    {
      dayNumber: 2,
      theme: 'North Goa Forts, Coastal Beaches & Artisanal Cafes',
      dailyCostEstimate: 5100,
      slots: [
        {
          time: '09:00 AM',
          title: 'Courtyard Breakfast & Drive to Sinquerim',
          category: 'Food',
          details: 'Complimentary breakfast at hotel, then head north along the coastal road.',
          distanceAndTravelTime: '6.5 km · 18 mins drive',
          openingHours: '08:00 AM – 10:30 AM',
          estimatedCost: 300,
        },
        {
          time: '10:00 AM',
          title: 'Fort Aguada Ramparts & 17th-Century Lighthouse',
          category: 'Attraction',
          details: 'Explore the 1612 Portuguese bastion and panoramic Arabian Sea views before midday heat.',
          distanceAndTravelTime: '6.5 km from hotel',
          openingHours: '09:30 AM – 06:00 PM',
          estimatedCost: 50,
        },
        {
          time: '01:15 PM',
          title: 'Courtyard Lunch at Cafe Bodega / Navtara',
          category: 'Food',
          details: 'Shaded courtyard lunch with artisanal poi sandwiches, cold brew, or Goan veg specials.',
          distanceAndTravelTime: '5.5 km · 15 mins drive',
          openingHours: '10:00 AM – 07:00 PM',
          estimatedCost: 450,
        },
        {
          time: '04:15 PM',
          title: 'Candolim & Sinquerim Beach Golden Hour Relaxation',
          category: 'Attraction',
          details: 'Swim in lifeguard-monitored zones and watch the Arabian Sea sunset.',
          distanceAndTravelTime: '4.8 km · 14 mins drive',
          openingHours: 'Lifeguards until 06:00 PM',
          estimatedCost: 600,
        },
        {
          time: '08:00 PM',
          title: 'Riverside Seafood & Local Specialties Dinner',
          category: 'Food',
          details: 'Dinner featuring Goan curry rice, grilled catch, or mushroom xacuti with live acoustic music.',
          distanceAndTravelTime: '3.4 km · 10 mins drive',
          openingHours: '12:00 PM – 11:30 PM',
          estimatedCost: 850,
        },
      ],
    },
    {
      dayNumber: 3,
      theme: 'Old Goa UNESCO Heritage, Divar Island Ferry & Spice Shopping',
      dailyCostEstimate: 4950,
      slots: [
        {
          time: '09:15 AM',
          title: 'Basilica of Bom Jesus & Se Cathedral Heritage Circuit',
          category: 'Attraction',
          details: 'Visit the iconic UNESCO World Heritage churches and Archaeological Museum in Old Goa.',
          distanceAndTravelTime: '9.8 km · 22 mins drive',
          openingHours: '09:00 AM – 06:30 PM',
          estimatedCost: 100,
        },
        {
          time: '11:45 AM',
          title: 'Free River Ferry to Divar Island Backwaters',
          category: 'Attraction',
          details: 'Cross the Mandovi River on the roll-on ferry; explore quiet village lanes and hilltop viewpoint.',
          distanceAndTravelTime: '1.5 km to Old Goa Ferry Wharf',
          openingHours: '06:30 AM – 09:00 PM (Every 15 mins)',
          estimatedCost: 50,
        },
        {
          time: '01:30 PM',
          title: 'Authentic Village Lunch & Kokum Cooler',
          category: 'Food',
          details: 'Homestyle Goan lunch with fresh local produce and traditional bebinca dessert.',
          distanceAndTravelTime: 'On Divar / Ribandar return route',
          openingHours: '12:30 PM – 03:30 PM',
          estimatedCost: 420,
        },
        {
          time: '04:30 PM',
          title: 'Panaji Municipal Market & Azulejos Tile Shopping',
          category: 'Shopping',
          details: 'Pick up roasted Goan cashews, kokum, spice masalas, and hand-painted ceramic nameplates.',
          distanceAndTravelTime: '1.0 km · 5 mins from hotel',
          openingHours: '09:00 AM – 08:30 PM',
          estimatedCost: 900,
        },
      ],
    },
    {
      dayNumber: 4,
      theme: 'Morning Mangrove Walk, Checkout & Airport Transfer',
      dailyCostEstimate: 2650,
      slots: [
        {
          time: '07:30 AM',
          title: 'Salim Ali Mangrove Boardwalk / Morning Beach Walk',
          category: 'Attraction',
          details: 'Peaceful morning walk along Ribandar ferry point and mangrove estuary.',
          distanceAndTravelTime: '4.5 km · 12 mins drive',
          openingHours: '06:00 AM – 05:30 PM',
          estimatedCost: 100,
        },
        {
          time: '11:00 AM',
          title: 'Hotel Checkout & Final Souvenir Pack',
          category: 'Hotel',
          details: 'Complete room checkout and verify airport transfer pickup.',
          distanceAndTravelTime: 'At Hotel',
          openingHours: 'Checkout by 11:00 AM',
          estimatedCost: 0,
        },
        {
          time: '12:15 PM',
          title: 'Farewell Goan Cafe Lunch & Bakery Treats',
          category: 'Food',
          details: 'Light lunch with Goan savories and serradura pudding before airport departure.',
          distanceAndTravelTime: '0.6 km from hotel',
          openingHours: '08:00 AM – 10:00 PM',
          estimatedCost: 450,
        },
        {
          time: '02:00 PM',
          title: 'Hotel to Goa Airport (GOX/GOI) Cab Transfer',
          category: 'Transport',
          details: 'Direct AC sedan transfer to airport terminal arriving 2 hours prior to return flight.',
          distanceAndTravelTime: '32 km · 50 mins drive',
          openingHours: 'Pre-booked slot',
          estimatedCost: 1100,
        },
      ],
    },
  ],
  smartTips: [
    'Use the official Goa Miles app or airport prepaid taxi counters to avoid uncalibrated tourist cab fares.',
    'Carry breathable cotton clothing, reef-safe sunscreen, and a compact umbrella for brief coastal showers.',
    'Respect heritage quiet zones in Fontainhas and dress modestly when visiting Old Goa basilicas and temples.',
  ],
};

export const TRAVEL_ESSENTIALS_DATA = {
  officialSourceCitation:
    'Verified Reference: Goa Tourism Development Corporation (GTDC) & India National Emergency Response System (112) · Updated Sept 2026',
  emergencyContacts: [
    { label: 'National All-in-One Emergency (Police / Fire / Ambulance)', number: '112' },
    { label: 'Goa Tourist Helpline & Assistance Desk', number: '1364 / +91-832-2437728' },
    { label: 'Coastal Lifeguard & Beach Safety (Drishti Marine)', number: '+91-832-2421201' },
    { label: 'Medical Ambulance Service (EMRI)', number: '108' },
    { label: 'Women & Senior Citizen Helpline', number: '1091' },
  ],
  facilities: [
    {
      type: 'Hospitals',
      items: [
        'Goa Medical College & Hospital, Bambolim (24/7 Emergency · 6 km from Panaji)',
        'Manipal Hospital Goa, Dona Paula (24/7 Multi-Specialty · 5.5 km from Panaji)',
        'Healthway Hospital, Old Goa (24/7 Trauma & Care)',
      ],
    },
    {
      type: 'Pharmacies',
      items: [
        'Wellness Forever 24x7 Pharmacy, 18th June Road, Panaji',
        'Apollo Pharmacy, Candolim Main Road (07:00 AM – 11:00 PM)',
      ],
    },
    {
      type: 'ATMs & Currency',
      items: [
        'SBI, HDFC & ICICI 24/7 ATM Cluster, MG Road & Patto Plaza, Panaji',
        'Currency: Indian Rupee (₹ / INR) · UPI QR payments accepted at 95%+ cafes, cabs & shops',
      ],
    },
    {
      type: 'Police & Tourist Info',
      items: [
        'Panaji Town Police Station (+91-832-2428482) & Calangute Tourist Police Booth',
        'GTDC Paryatan Bhavan Tourist Information Center, Patto, Panaji (09:30 AM – 05:30 PM)',
      ],
    },
  ],
  localeMeta: {
    currency: 'Indian Rupee (₹ / INR)',
    languages: 'Konkani, Marathi, English, Hindi (widely spoken across all tourist hubs)',
    timeZone: 'IST (UTC +05:30)',
    localTransport:
      'Goa Miles app cabs, KTCL electric shuttle buses (Airport ↔ Panaji ↔ Calangute), roll-on river ferries, and licensed yellow-black rented two-wheelers.',
  },
  localRules: [
    'Swimming in the sea after sunset (06:00 PM) or under red flags is strictly prohibited by coastal safety law.',
    'Driving or riding a rented vehicle requires an original valid Driving License; helmets are mandatory for two-wheeler riders.',
    'Consumption of alcohol or glass bottles on open public beaches is prohibited and carries on-the-spot fines.',
    'Fontainhas is a living residential neighborhood—avoid loud group photography on private house verandas.',
  ],
  requiredDocuments: [
    'Original Government Photo ID (Aadhaar Card, Passport, Voter ID, or Driving License) for airport entry & hotel check-in.',
    'Original Driving License (if renting a self-drive car or two-wheeler).',
    'International Travellers: Valid Passport + Indian e-Visa / Regular Visa printout.',
    'Flight/Train tickets and Hotel booking confirmation (digital or printed).',
  ],
  defaultPackingChecklist: [
    { id: 'pk-1', label: 'Original Photo ID & Driving License', checked: true },
    { id: 'pk-2', label: 'Breathable cotton/linen outfits & swimwear', checked: true },
    { id: 'pk-3', label: 'SPF 50+ sunscreen, sunglasses & wide-brim hat', checked: false },
    { id: 'pk-4', label: 'Comfortable walking sandals for forts & heritage walks', checked: false },
    { id: 'pk-5', label: 'Power bank, charging cables & UPI-enabled phone', checked: true },
    { id: 'pk-6', label: 'Basic personal medication, ORS packets & band-aids', checked: false },
    { id: 'pk-7', label: 'Light rain poncho / compact umbrella', checked: false },
  ],
};
