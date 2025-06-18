// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import Table from '@cloudscape-design/components/table';

import {
  DailyForecast,
  formatDate,
  formatTemperature,
  getWeatherDescription,
  getWeatherIcon,
} from '../../services/weather-api';
import { WidgetConfig } from '../interfaces';

interface DailyForecastContentProps {
  forecast: DailyForecast | null;
  loading: boolean;
  error?: string;
  temperatureUnit: 'C' | 'F';
}

function DailyForecastHeader() {
  return (
    <Header variant="h2" description="7-day weather forecast">
      Daily Forecast
    </Header>
  );
}

function DailyForecastContent({ forecast, loading, error, temperatureUnit }: DailyForecastContentProps) {
  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading forecast data...
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

  if (!forecast) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p">No forecast data available</Box>
      </Box>
    );
  }

  const forecastItems = forecast.time.map((time, index) => ({
    date: time,
    formattedDate: formatDate(time),
    weatherCode: forecast.weatherCode[index],
    temperatureMax: forecast.temperatureMax[index],
    temperatureMin: forecast.temperatureMin[index],
    precipitation: forecast.precipitation[index],
    windSpeed: forecast.windSpeed[index],
    isToday: index === 0,
  }));

  return (
    <Table
      columnDefinitions={[
        {
          id: 'date',
          header: 'Date',
          cell: item => (
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Box fontWeight={item.isToday ? 'bold' : 'normal'}>{item.isToday ? 'Today' : item.formattedDate}</Box>
            </SpaceBetween>
          ),
        },
        {
          id: 'weather',
          header: 'Weather',
          cell: item => (
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <span style={{ fontSize: '1.2em' }}>{getWeatherIcon(item.weatherCode)}</span>
              <Box>{getWeatherDescription(item.weatherCode)}</Box>
            </SpaceBetween>
          ),
        },
        {
          id: 'temperature',
          header: 'Temperature',
          cell: item => (
            <SpaceBetween direction="horizontal" size="xs">
              <Box fontWeight="bold">{formatTemperature(item.temperatureMax, temperatureUnit)}</Box>
              <Box color="text-body-secondary">{formatTemperature(item.temperatureMin, temperatureUnit)}</Box>
            </SpaceBetween>
          ),
        },
        {
          id: 'precipitation',
          header: 'Precipitation',
          cell: item => `${item.precipitation.toFixed(1)} mm`,
        },
        {
          id: 'wind',
          header: 'Wind',
          cell: item => `${item.windSpeed} km/h`,
        },
      ]}
      items={forecastItems}
      variant="embedded"
      stickyHeader={false}
      stripedRows={false}
      trackBy="date"
      empty={
        <Box textAlign="center" color="inherit" margin={{ vertical: 'xs' }}>
          <Box variant="p" color="inherit">
            No forecast data available
          </Box>
        </Box>
      }
    />
  );
}

export function createDailyForecastWidget(
  forecast: DailyForecast | null,
  loading: boolean,
  error?: string,
  temperatureUnit: 'C' | 'F' = 'C',
): WidgetConfig {
  return {
    definition: { defaultRowSpan: 4, defaultColumnSpan: 2 },
    data: {
      icon: 'table',
      title: 'Daily Forecast',
      description: '7-day weather forecast',
      header: DailyForecastHeader,
      content: () => (
        <DailyForecastContent forecast={forecast} loading={loading} error={error} temperatureUnit={temperatureUnit} />
      ),
      staticMinHeight: 400,
    },
  };
}
