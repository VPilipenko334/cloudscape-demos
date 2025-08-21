// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Button from '@cloudscape-design/components/button';
import Input from '@cloudscape-design/components/input';
import FormField from '@cloudscape-design/components/form-field';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import LineChart from '@cloudscape-design/components/line-chart';
import BarChart from '@cloudscape-design/components/bar-chart';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

const weatherCodeMap: { [key: number]: { label: string; severity: 'success' | 'warning' | 'error' } } = {
  0: { label: 'Clear sky', severity: 'success' },
  1: { label: 'Mainly clear', severity: 'success' },
  2: { label: 'Partly cloudy', severity: 'success' },
  3: { label: 'Overcast', severity: 'warning' },
  45: { label: 'Fog', severity: 'warning' },
  48: { label: 'Depositing rime fog', severity: 'warning' },
  51: { label: 'Light drizzle', severity: 'warning' },
  53: { label: 'Moderate drizzle', severity: 'warning' },
  55: { label: 'Dense drizzle', severity: 'warning' },
  61: { label: 'Slight rain', severity: 'warning' },
  63: { label: 'Moderate rain', severity: 'error' },
  65: { label: 'Heavy rain', severity: 'error' },
  71: { label: 'Slight snow', severity: 'warning' },
  73: { label: 'Moderate snow', severity: 'error' },
  75: { label: 'Heavy snow', severity: 'error' },
  95: { label: 'Thunderstorm', severity: 'error' },
};

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData>({ name: 'New York', latitude: 40.7128, longitude: -74.0060 });
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto&forecast_days=7`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchLocationByName = async (locationName: string) => {
    if (!locationName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search location');
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const newLocation = {
          name: result.name + (result.country ? `, ${result.country}` : ''),
          latitude: result.latitude,
          longitude: result.longitude,
        };
        setLocation(newLocation);
        await fetchWeatherData(result.latitude, result.longitude);
      } else {
        throw new Error('Location not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(location.latitude, location.longitude);
  }, []);

  const formatTemperature = (temp: number) => `${Math.round(temp)}°C`;
  const formatWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const prepareHourlyChartData = () => {
    if (!weatherData?.hourly) return [];
    
    return weatherData.hourly.time.slice(0, 24).map((time, index) => ({
      x: new Date(time).getHours(),
      y: weatherData.hourly.temperature_2m[index],
    }));
  };

  const prepareDailyChartData = () => {
    if (!weatherData?.daily) return [];
    
    return weatherData.daily.time.map((time, index) => ({
      x: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
      max: weatherData.daily.temperature_2m_max[index],
      min: weatherData.daily.temperature_2m_min[index],
      precipitation: weatherData.daily.precipitation_sum[index],
    }));
  };

  const currentWeather = weatherData?.current;
  const weatherCondition = currentWeather?.weather_code 
    ? weatherCodeMap[currentWeather.weather_code] || { label: 'Unknown', severity: 'warning' as const }
    : { label: 'Loading...', severity: 'warning' as const };

  return (
    <AppLayout
      navigationHide
      toolsHide
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              actions={
                <Button
                  variant="primary"
                  iconName="refresh"
                  onClick={() => fetchWeatherData(location.latitude, location.longitude)}
                  loading={loading}
                >
                  Refresh
                </Button>
              }
            >
              Weather Dashboard
            </Header>
          }
        >
          <SpaceBetween size="l">
            {error && (
              <Alert type="error" dismissible onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Container>
              <SpaceBetween size="m">
                <Box variant="h2">Location Search</Box>
                <ColumnLayout columns={2}>
                  <FormField label="Search location">
                    <Input
                      value={searchLocation}
                      onChange={({ detail }) => setSearchLocation(detail.value)}
                      placeholder="Enter city name..."
                      onKeyDown={(e) => {
                        if (e.detail.key === 'Enter') {
                          searchLocationByName(searchLocation);
                        }
                      }}
                    />
                  </FormField>
                  <FormField label=" ">
                    <Button
                      variant="primary"
                      onClick={() => searchLocationByName(searchLocation)}
                      loading={loading}
                    >
                      Search
                    </Button>
                  </FormField>
                </ColumnLayout>
              </SpaceBetween>
            </Container>

            <Container>
              <SpaceBetween size="m">
                <Box variant="h2">Current Weather - {location.name}</Box>
                {loading && !weatherData ? (
                  <Box textAlign="center">
                    <Spinner size="large" />
                  </Box>
                ) : currentWeather ? (
                  <ColumnLayout columns={4}>
                    <Box>
                      <Box variant="h3">Temperature</Box>
                      <Box fontSize="display-l" fontWeight="bold">
                        {formatTemperature(currentWeather.temperature_2m)}
                      </Box>
                      <Box variant="small">
                        Feels like {formatTemperature(currentWeather.apparent_temperature)}
                      </Box>
                    </Box>
                    <Box>
                      <Box variant="h3">Conditions</Box>
                      <StatusIndicator type={weatherCondition.severity}>
                        {weatherCondition.label}
                      </StatusIndicator>
                    </Box>
                    <Box>
                      <Box variant="h3">Humidity</Box>
                      <Box variant="p">{currentWeather.relative_humidity_2m}%</Box>
                    </Box>
                    <Box>
                      <Box variant="h3">Wind</Box>
                      <Box variant="p">
                        {currentWeather.wind_speed_10m} km/h {formatWindDirection(currentWeather.wind_direction_10m)}
                      </Box>
                    </Box>
                  </ColumnLayout>
                ) : null}
              </SpaceBetween>
            </Container>

            <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
              <Container>
                <SpaceBetween size="m">
                  <Box variant="h2">24-Hour Temperature Trend</Box>
                  {weatherData?.hourly ? (
                    <LineChart
                      series={[
                        {
                          title: 'Temperature (°C)',
                          type: 'line',
                          data: prepareHourlyChartData(),
                        },
                      ]}
                      xDomain={[0, 23]}
                      yTitle="Temperature (°C)"
                      xTitle="Hour"
                      height={300}
                      hideFilter
                    />
                  ) : (
                    <Box textAlign="center">
                      <Spinner />
                    </Box>
                  )}
                </SpaceBetween>
              </Container>

              <Container>
                <SpaceBetween size="m">
                  <Box variant="h2">7-Day Forecast</Box>
                  {weatherData?.daily ? (
                    <BarChart
                      series={[
                        {
                          title: 'Max Temp (°C)',
                          type: 'bar',
                          data: prepareDailyChartData().map(d => ({ x: d.x, y: d.max })),
                        },
                        {
                          title: 'Min Temp (°C)',
                          type: 'bar',
                          data: prepareDailyChartData().map(d => ({ x: d.x, y: d.min })),
                        },
                      ]}
                      yTitle="Temperature (°C)"
                      xTitle="Day"
                      height={300}
                      hideFilter
                    />
                  ) : (
                    <Box textAlign="center">
                      <Spinner />
                    </Box>
                  )}
                </SpaceBetween>
              </Container>
            </Grid>

            <Container>
              <SpaceBetween size="m">
                <Box variant="h2">Weekly Overview</Box>
                {weatherData?.daily ? (
                  <ColumnLayout columns={7}>
                    {weatherData.daily.time.map((day, index) => {
                      const dayWeather = weatherCodeMap[weatherData.daily.weather_code[index]] || { label: 'Unknown', severity: 'warning' as const };
                      return (
                        <Box key={day} textAlign="center">
                          <Box variant="small" fontWeight="bold">
                            {new Date(day).toLocaleDateString('en-US', { weekday: 'short' })}
                          </Box>
                          <Box margin={{ top: 'xs', bottom: 'xs' }}>
                            <Badge color={dayWeather.severity === 'success' ? 'green' : dayWeather.severity === 'warning' ? 'blue' : 'red'}>
                              {dayWeather.label}
                            </Badge>
                          </Box>
                          <Box variant="small">
                            <strong>{formatTemperature(weatherData.daily.temperature_2m_max[index])}</strong>
                          </Box>
                          <Box variant="small" color="text-status-inactive">
                            {formatTemperature(weatherData.daily.temperature_2m_min[index])}
                          </Box>
                          <Box variant="small">
                            {weatherData.daily.precipitation_sum[index].toFixed(1)}mm
                          </Box>
                        </Box>
                      );
                    })}
                  </ColumnLayout>
                ) : (
                  <Box textAlign="center">
                    <Spinner />
                  </Box>
                )}
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        </ContentLayout>
      }
    />
  );
}
