import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  80: 'Rain Showers',
  81: 'Moderate Showers',
  82: 'Heavy Showers',
  95: 'Thunderstorm',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // =========================================================================
  // 1. Real-Time Weather API Endpoint (Open-Meteo Live Feed + Fallback)
  // =========================================================================
  app.get('/api/weather', async (req, res) => {
    const lat = parseFloat(String(req.query.lat || '15.4909'));
    const lng = parseFloat(String(req.query.lng || '73.8278'));
    const city = String(req.query.city || 'Goa');

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,weather_code&timezone=auto&forecast_days=5`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`Weather upstream status ${response.status}`);
      }
      const data = await response.json();

      const currentCode = data.current?.weather_code ?? 1;
      const dailyForecast = (data.daily?.time || []).map((dateStr: string, idx: number) => ({
        date: dateStr,
        maxTemp: Math.round(data.daily.temperature_2m_max?.[idx] ?? 31),
        minTemp: Math.round(data.daily.temperature_2m_min?.[idx] ?? 24),
        rainProb: data.daily.precipitation_probability_max?.[idx] ?? 15,
        condition: WEATHER_CODE_MAP[data.daily.weather_code?.[idx] ?? 1] || 'Partly Sunny',
        sunrise: data.daily.sunrise?.[idx]?.split('T')[1] || '06:18',
        sunset: data.daily.sunset?.[idx]?.split('T')[1] || '18:32',
      }));

      res.json({
        isLive: true,
        sourceLabel: 'LIVE DATA · Open-Meteo Meteorological Feed',
        city,
        temperature: Math.round(data.current?.temperature_2m ?? 30),
        humidity: data.current?.relative_humidity_2m ?? 72,
        rainProbability:
          data.current?.precipitation_probability ??
          data.daily?.precipitation_probability_max?.[0] ??
          15,
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 14),
        condition: WEATHER_CODE_MAP[currentCode] || 'Warm & Coastal Breeze',
        sunrise: dailyForecast[0]?.sunrise || '06:18',
        sunset: dailyForecast[0]?.sunset || '18:32',
        daily: dailyForecast,
      });
    } catch (error) {
      res.json({
        isLive: false,
        sourceLabel: 'ESTIMATED / DEMO SEASONAL DATA',
        city,
        temperature: 30,
        humidity: 74,
        rainProbability: 18,
        windSpeed: 14,
        condition: 'Partly Sunny · Coastal Breeze',
        sunrise: '06:18',
        sunset: '18:32',
        daily: [
          { date: 'Day 1', maxTemp: 31, minTemp: 25, rainProb: 15, condition: 'Mostly Sunny', sunrise: '06:18', sunset: '18:32' },
          { date: 'Day 2', maxTemp: 30, minTemp: 24, rainProb: 20, condition: 'Partly Cloudy', sunrise: '06:18', sunset: '18:31' },
          { date: 'Day 3', maxTemp: 31, minTemp: 25, rainProb: 10, condition: 'Clear Sky', sunrise: '06:19', sunset: '18:31' },
          { date: 'Day 4', maxTemp: 29, minTemp: 24, rainProb: 25, condition: 'Light Coastal Breeze', sunrise: '06:19', sunset: '18:30' },
        ],
      });
    }
  });

  // =========================================================================
  // 2. Gemini AI Complete Trip Planner & Smart Recommendation Engine
  // =========================================================================
  app.post('/api/ai/plan-trip', async (req, res) => {
    const {
      origin = 'Hyderabad',
      destination = 'Goa',
      startDate = '2026-10-15',
      endDate = '2026-10-18',
      days = 4,
      budget = 25000,
      travellers = 2,
      tripType = 'Couple',
      interests = ['Beaches', 'Local Food', 'Historical Places'],
      naturalPrompt = '',
    } = req.body || {};

    try {
      const ai = getGenAIClient();
      const promptText = naturalPrompt
        ? `User Request: "${naturalPrompt}". Context: Origin=${origin}, Destination=${destination}, Dates=${startDate} to ${endDate} (${days} days), Total Budget=₹${budget}, Travellers=${travellers} (${tripType}), Interests=${interests.join(', ')}.`
        : `Plan a complete ${days}-day trip from ${origin} to ${destination} (${startDate} to ${endDate}) for ${travellers} traveller(s) (${tripType}) with a target budget of ₹${budget}. Key interests: ${interests.join(', ')}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${promptText}
Create a realistic, detailed daily itinerary and budget allocation in INR (₹) that respects travel times, opening hours, distances from the hotel hub, local food specialties, and transport modes.`,
        config: {
          systemInstruction:
            'You are TravelMate AI, a senior travel logistics architect. Always output realistic travel times, opening hours, and accurate INR cost estimates tailored to the requested destination and budget.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tripTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              recommendedTier: {
                type: Type.STRING,
                description: 'Budget, Standard, or Premium based on user budget',
              },
              recommendedHotelArea: { type: Type.STRING },
              recommendedTransportNote: { type: Type.STRING },
              budgetBreakdown: {
                type: Type.OBJECT,
                properties: {
                  flightsOrTrain: { type: Type.INTEGER },
                  hotel: { type: Type.INTEGER },
                  cabsAndLocal: { type: Type.INTEGER },
                  food: { type: Type.INTEGER },
                  attractions: { type: Type.INTEGER },
                  shopping: { type: Type.INTEGER },
                  miscellaneous: { type: Type.INTEGER },
                  totalEstimated: { type: Type.INTEGER },
                },
                required: [
                  'flightsOrTrain',
                  'hotel',
                  'cabsAndLocal',
                  'food',
                  'attractions',
                  'shopping',
                  'miscellaneous',
                  'totalEstimated',
                ],
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    theme: { type: Type.STRING },
                    dailyCostEstimate: { type: Type.INTEGER },
                    slots: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          category: {
                            type: Type.STRING,
                            description: 'Transport, Hotel, Food, Attraction, or Shopping',
                          },
                          details: { type: Type.STRING },
                          distanceAndTravelTime: { type: Type.STRING },
                          openingHours: { type: Type.STRING },
                          estimatedCost: { type: Type.INTEGER },
                        },
                        required: [
                          'time',
                          'title',
                          'category',
                          'details',
                          'distanceAndTravelTime',
                          'openingHours',
                          'estimatedCost',
                        ],
                      },
                    },
                  },
                  required: ['dayNumber', 'theme', 'dailyCostEstimate', 'slots'],
                },
              },
              smartTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'tripTitle',
              'summary',
              'recommendedTier',
              'recommendedHotelArea',
              'recommendedTransportNote',
              'budgetBreakdown',
              'days',
              'smartTips',
            ],
          },
        },
      });

      const rawText = response.text?.trim() || '{}';
      const parsed = JSON.parse(rawText);
      res.json({
        isAiGenerated: true,
        sourceLabel: 'AI GENERATED · Gemini 3.8 Flash + Estimated Local Fares',
        plan: parsed,
      });
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'AI Trip Planner error';
      res.status(500).json({
        error: errMessage,
        message: 'Could not reach Gemini AI service right now. Showing smart local itinerary estimate.',
      });
    }
  });

  // =========================================================================
  // 3. Gemini AI Travel Chat Assistant Endpoint
  // =========================================================================
  app.post('/api/ai/chat', async (req, res) => {
    const { message, tripContext } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    try {
      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Current User Trip Context:
${JSON.stringify(tripContext || {}, null, 2)}

User Question: "${message}"

Provide a concise, actionable, well-structured travel response referencing their specific trip details, budget, hotel distances, local transport, and safety tips. Clearly label any prices or availability as estimated unless verified by live APIs.`,
        config: {
          systemInstruction:
            'You are TravelMate AI Assistant. Help travellers plan itineraries, find budget/mid-range/luxury hotels, vegetarian & local restaurants, cab routes, packing lists, and budget optimizations. Keep answers practical, clear, and honest about estimated vs live data.',
        },
      });

      res.json({
        reply: response.text || 'I could not generate a response. Please try asking again.',
      });
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : 'AI Assistant unavailable';
      res.status(500).json({
        error: errMessage,
      });
    }
  });

  // =========================================================================
  // Vite Middleware (Dev) or Static Assets (Prod)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TravelMate AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
