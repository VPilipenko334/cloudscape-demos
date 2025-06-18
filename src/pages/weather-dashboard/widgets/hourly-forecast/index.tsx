// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Box from '@cloudscape-design/components/box';
import Header from '@cloudscape-design/components/header';
import LineChart from '@cloudscape-design/components/line-chart';
import Spinner from '@cloudscape-design/components/spinner';

import { HourlyForecast, formatTime, formatTemperature } from '../../services/weather-api';
import { WidgetConfig } from '../interfaces';

interface HourlyForecastContentProps {
  forecast: HourlyForecast | null;
  loading: boolean;
  error?: string;
  temperatureUnit: 'C' | 'F';
}

function HourlyForecastHeader() {
  return (
    <Header variant="h2" description="24-hour temperature and precipitation forecast">
      Hourly Forecast
    </Header>
  );
}

function HourlyForecastContent({ forecast, loading, error, temperatureUnit }: HourlyForecastContentProps) {
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

  const temperatureData = forecast.time.map((time, index) => {
    const temp = forecast.temperature[index];
    const convertedTemp = temperatureUnit === 'F' ? Math.round((temp * 9) / 5 + 32) : temp;
    return {
      x: new Date(time),
      y: convertedTemp,
    };
  });

  const precipitationData = forecast.time.map((time, index) => ({
    x: new Date(time),
    y: forecast.precipitation[index],
  }));

  return (
    <LineChart
      series={[
        {
          title: `Temperature (°${temperatureUnit})`,
          type: 'line',
          data: temperatureData,
          color: '#2563eb',
        },
        {
          title: 'Precipitation (mm)',
          type: 'line',
          data: precipitationData,
          color: '#059669',
        },
      ]}
      xDomain={[new Date(forecast.time[0]), new Date(forecast.time[forecast.time.length - 1])]}
      yDomain={[Math.min(...forecast.temperature, 0), Math.max(...forecast.temperature, ...forecast.precipitation) + 5]}
      xScaleType="time"
      xTitle="Time"
      yTitle="Value"
      height={300}
      fitHeight={false}
      hideFilter={true}
      hideLegend={false}
      i18nStrings={{
        xTickFormatter: value => formatTime(value.toISOString()),
        yTickFormatter: value => value.toString(),
        filterLabel: 'Filter displayed data',
        filterPlaceholder: 'Filter data',
        legendAriaLabel: 'Legend',
        chartAriaRoleDescription: 'Line chart showing hourly weather forecast',
        detailPopoverDismissAriaLabel: 'Dismiss',
        detailTotalLabel: 'Total',
      }}
      ariaLabel="Hourly weather forecast"
      ariaDescription="Line chart showing temperature and precipitation for the next 24 hours"
      detailPopoverSeriesContent={({ series, y }) => ({
        key: series.title,
        value: series.title.includes('Temperature') ? formatTemperature(y, temperatureUnit) : `${y} mm`,
      })}
    />
  );
}

export function createHourlyForecastWidget(
  forecast: HourlyForecast | null,
  loading: boolean,
  error?: string,
  temperatureUnit: 'C' | 'F' = 'C',
): WidgetConfig {
  return {
    definition: { defaultRowSpan: 4, defaultColumnSpan: 2, minRowSpan: 3 },
    data: {
      icon: 'lineChart',
      title: 'Hourly Forecast',
      description: '24-hour temperature and precipitation forecast',
      header: HourlyForecastHeader,
      content: () => (
        <HourlyForecastContent forecast={forecast} loading={loading} error={error} temperatureUnit={temperatureUnit} />
      ),
      staticMinHeight: 360,
    },
  };
}
