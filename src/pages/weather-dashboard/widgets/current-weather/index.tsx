// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';

import { CurrentWeather, formatTemperature, getWeatherDescription, getWeatherIcon } from '../../services/weather-api';
import { WidgetConfig } from '../interfaces';

interface CurrentWeatherContentProps {
  weather: CurrentWeather | null;
  loading: boolean;
  error?: string;
  temperatureUnit: 'C' | 'F';
}

function CurrentWeatherHeader() {
  return (
    <Header variant="h2" description="Current weather conditions">
      Current Weather
    </Header>
  );
}

function CurrentWeatherContent({ weather, loading, error, temperatureUnit }: CurrentWeatherContentProps) {
  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading weather data...
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p" color="text-status-error">
          {error}
        </Box>
      </Box>
    );
  }

  if (!weather) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p">No weather data available</Box>
      </Box>
    );
  }

  return (
    <SpaceBetween size="m">
      <div style={{ textAlign: 'center' }}>
        <Box fontSize="display-l" fontWeight="bold">
          {getWeatherIcon(weather.weatherCode)} {formatTemperature(weather.temperature, temperatureUnit)}
        </Box>
        <Box variant="h3" color="text-body-secondary">
          {getWeatherDescription(weather.weatherCode)}
        </Box>
      </div>

      <ColumnLayout columns={2} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Wind Speed</Box>
          <Box>{weather.windSpeed} km/h</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Humidity</Box>
          <Box>{weather.humidity}%</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Precipitation</Box>
          <Box>{weather.precipitation} mm</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Wind Direction</Box>
          <Box>{weather.windDirection}°</Box>
        </div>
      </ColumnLayout>
    </SpaceBetween>
  );
}

export function createCurrentWeatherWidget(
  weather: CurrentWeather | null,
  loading: boolean,
  error?: string,
  temperatureUnit: 'C' | 'F' = 'C',
): WidgetConfig {
  return {
    definition: { defaultRowSpan: 3, defaultColumnSpan: 1 },
    data: {
      icon: 'list',
      title: 'Current Weather',
      description: 'Current weather conditions',
      header: CurrentWeatherHeader,
      content: () => (
        <CurrentWeatherContent weather={weather} loading={loading} error={error} temperatureUnit={temperatureUnit} />
      ),
    },
  };
}
