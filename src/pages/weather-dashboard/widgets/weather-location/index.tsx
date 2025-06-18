// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';

import { WeatherData } from '../../services/weather-api';
import { WidgetConfig } from '../interfaces';

interface WeatherLocationContentProps {
  weatherData: WeatherData | null;
  loading: boolean;
  error?: string;
  locationName: string;
  onRefreshLocation: () => void;
}

function WeatherLocationHeader() {
  return (
    <Header variant="h2" description="Current location and weather information">
      Location & Info
    </Header>
  );
}

function WeatherLocationContent({
  weatherData,
  loading,
  error,
  locationName,
  onRefreshLocation,
}: WeatherLocationContentProps) {
  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" padding={{ top: 's' }}>
          Loading location data...
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
        <Box padding={{ top: 's' }}>
          <Button onClick={onRefreshLocation}>Retry</Button>
        </Box>
      </Box>
    );
  }

  if (!weatherData) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p">No location data available</Box>
        <Box padding={{ top: 's' }}>
          <Button onClick={onRefreshLocation}>Get Location</Button>
        </Box>
      </Box>
    );
  }

  const lastUpdated = new Date(weatherData.current.time).toLocaleString();

  return (
    <SpaceBetween size="m">
      <ColumnLayout columns={1} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Location</Box>
          <Box fontWeight="bold">{locationName}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Coordinates</Box>
          <Box>
            {weatherData.location.latitude.toFixed(4)}°, {weatherData.location.longitude.toFixed(4)}°
          </Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Timezone</Box>
          <Box>{weatherData.location.timezone}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Last Updated</Box>
          <Box>{lastUpdated}</Box>
        </div>
      </ColumnLayout>

      <SpaceBetween direction="horizontal" size="xs">
        <Button onClick={onRefreshLocation} iconName="refresh">
          Refresh Location
        </Button>
      </SpaceBetween>
    </SpaceBetween>
  );
}

export function createWeatherLocationWidget(
  weatherData: WeatherData | null,
  loading: boolean,
  error: string | undefined,
  locationName: string,
  onRefreshLocation: () => void,
): WidgetConfig {
  return {
    definition: { defaultRowSpan: 3, defaultColumnSpan: 1 },
    data: {
      icon: 'settings',
      title: 'Location & Info',
      description: 'Current location and weather information',
      header: WeatherLocationHeader,
      content: () => (
        <WeatherLocationContent
          weatherData={weatherData}
          loading={loading}
          error={error}
          locationName={locationName}
          onRefreshLocation={onRefreshLocation}
        />
      ),
    },
  };
}
