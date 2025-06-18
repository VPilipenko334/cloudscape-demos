// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from 'react';

import Grid from '@cloudscape-design/components/grid';

import { WeatherData, fetchWeatherData, getCurrentLocation } from '../services/weather-api';
import {
  createCurrentWeatherWidget,
  createHourlyForecastWidget,
  createDailyForecastWidget,
  createWeatherLocationWidget,
} from '../widgets';
import { BaseStaticWidget } from './base-static-widget';

export function Content() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [locationName, setLocationName] = useState('Unknown Location');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(undefined);

      const location = await getCurrentLocation();
      setLocationName(location.name);

      const data = await fetchWeatherData(location.latitude, location.longitude);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const widgets = [
    createCurrentWeatherWidget(weatherData?.current || null, loading, error, temperatureUnit),
    createWeatherLocationWidget(
      weatherData,
      loading,
      error,
      locationName,
      loadWeatherData,
      temperatureUnit,
      setTemperatureUnit,
    ),
    createHourlyForecastWidget(weatherData?.hourly || null, loading, error, temperatureUnit),
    createDailyForecastWidget(weatherData?.daily || null, loading, error, temperatureUnit),
  ];

  return (
    <Grid
      gridDefinition={[
        { colspan: { l: 6, m: 6, default: 12 } }, // Current weather
        { colspan: { l: 6, m: 6, default: 12 } }, // Location info
        { colspan: { l: 12, m: 12, default: 12 } }, // Hourly forecast (full width)
        { colspan: { l: 12, m: 12, default: 12 } }, // Daily forecast (full width)
      ]}
    >
      {widgets.map((widget, index) => (
        <BaseStaticWidget key={index} config={widget.data} />
      ))}
    </Grid>
  );
}
