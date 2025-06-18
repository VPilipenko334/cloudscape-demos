// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  precipitation: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  precipitation: number[];
  weatherCode: number[];
  windSpeed: number[];
}

export interface DailyForecast {
  time: string[];
  temperatureMax: number[];
  temperatureMin: number[];
  weatherCode: number[];
  precipitation: number[];
  windSpeed: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  56: { description: 'Light freezing drizzle', icon: '🌨️' },
  57: { description: 'Dense freezing drizzle', icon: '🌨️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  66: { description: 'Light freezing rain', icon: '🌨️' },
  67: { description: 'Heavy freezing rain', icon: '🌨️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '❄️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '❄️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

// Default location: San Francisco
const DEFAULT_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'San Francisco',
};

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number; name: string }> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: 'Current Location',
        });
      },
      () => {
        resolve(DEFAULT_LOCATION);
      },
      { timeout: 10000 },
    );
  });
}

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.append('latitude', latitude.toString());
  url.searchParams.append('longitude', longitude.toString());
  url.searchParams.append(
    'current',
    'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
  );
  url.searchParams.append('hourly', 'temperature_2m,precipitation,weather_code,wind_speed_10m');
  url.searchParams.append(
    'daily',
    'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max',
  );
  url.searchParams.append('timezone', 'auto');
  url.searchParams.append('forecast_days', '7');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: data.current.wind_direction_10m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      time: data.current.time,
    },
    hourly: {
      time: data.hourly.time.slice(0, 24), // Next 24 hours
      temperature: data.hourly.temperature_2m.slice(0, 24).map((temp: number) => Math.round(temp)),
      precipitation: data.hourly.precipitation.slice(0, 24),
      weatherCode: data.hourly.weather_code.slice(0, 24),
      windSpeed: data.hourly.wind_speed_10m.slice(0, 24).map((speed: number) => Math.round(speed)),
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max.map((temp: number) => Math.round(temp)),
      temperatureMin: data.daily.temperature_2m_min.map((temp: number) => Math.round(temp)),
      weatherCode: data.daily.weather_code,
      precipitation: data.daily.precipitation_sum,
      windSpeed: data.daily.wind_speed_10m_max.map((speed: number) => Math.round(speed)),
    },
    location: {
      latitude,
      longitude,
      timezone: data.timezone,
    },
  };
}

export function getWeatherDescription(weatherCode: number): string {
  return WEATHER_CODES[weatherCode]?.description || 'Unknown';
}

export function getWeatherIcon(weatherCode: number): string {
  return WEATHER_CODES[weatherCode]?.icon || '❓';
}

export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    const fahrenheit = Math.round((temp * 9) / 5 + 32);
    return `${fahrenheit}°F`;
  }
  return `${temp}°C`;
}

export function convertTemperature(temp: number, fromUnit: 'C' | 'F', toUnit: 'C' | 'F'): number {
  if (fromUnit === toUnit) return temp;

  if (fromUnit === 'C' && toUnit === 'F') {
    return Math.round((temp * 9) / 5 + 32);
  }

  if (fromUnit === 'F' && toUnit === 'C') {
    return Math.round(((temp - 32) * 5) / 9);
  }

  return temp;
}

export function formatTime(timeString: string): string {
  return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timeString: string): string {
  return new Date(timeString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
