// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';

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
    <div
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        paddingBottom: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          minWidth: 'max-content',
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
      >
        {forecastItems.map((item, index) => (
          <div
            key={item.date}
            style={{
              backgroundColor: item.isToday ? '#f3f4f6' : '#ffffff',
              border: item.isToday ? '2px solid #0066cc' : '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
              minWidth: '140px',
              textAlign: 'center',
              boxShadow: item.isToday ? '0 4px 6px rgba(0, 102, 204, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = item.isToday
                ? '0 4px 6px rgba(0, 102, 204, 0.1)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <SpaceBetween size="xs">
              {/* Date */}
              <Box
                variant="strong"
                fontSize={item.isToday ? 'body-m' : 'body-s'}
                color={item.isToday ? 'text-status-info' : 'text-body-default'}
              >
                {item.isToday ? 'Today' : item.formattedDate}
              </Box>

              {/* Weather Icon */}
              <div style={{ fontSize: '3em', margin: '8px 0' }}>{getWeatherIcon(item.weatherCode)}</div>

              {/* Weather Description */}
              <Box
                variant="small"
                color="text-body-secondary"
                style={{
                  fontSize: '11px',
                  lineHeight: '1.2',
                  minHeight: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getWeatherDescription(item.weatherCode)}
              </Box>

              {/* Temperature */}
              <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                <Box fontWeight="bold" fontSize="body-m">
                  {formatTemperature(item.temperatureMax, temperatureUnit)}
                </Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  {formatTemperature(item.temperatureMin, temperatureUnit)}
                </Box>
              </SpaceBetween>

              {/* Additional Info */}
              <SpaceBetween size="xxs">
                <Box fontSize="body-s" color="text-body-secondary">
                  💧 {item.precipitation.toFixed(1)}mm
                </Box>
                <Box fontSize="body-s" color="text-body-secondary">
                  💨 {item.windSpeed}km/h
                </Box>
              </SpaceBetween>
            </SpaceBetween>
          </div>
        ))}
      </div>
    </div>
  );
}

export function createDailyForecastWidget(
  forecast: DailyForecast | null,
  loading: boolean,
  error?: string,
  temperatureUnit: 'C' | 'F' = 'C',
): WidgetConfig {
  return {
    definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
    data: {
      icon: 'table',
      title: 'Daily Forecast',
      description: '7-day weather forecast',
      header: DailyForecastHeader,
      content: () => (
        <DailyForecastContent forecast={forecast} loading={loading} error={error} temperatureUnit={temperatureUnit} />
      ),
      staticMinHeight: 320,
    },
  };
}
