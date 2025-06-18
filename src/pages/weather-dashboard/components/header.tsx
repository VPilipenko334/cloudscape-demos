// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface WeatherDashboardHeaderProps {
  actions?: React.ReactNode;
}

export function WeatherDashboardHeader({ actions }: WeatherDashboardHeaderProps) {
  return (
    <Header
      variant="h1"
      description="Real-time weather data and forecasts powered by Open Meteo API"
      actions={
        actions && (
          <SpaceBetween direction="horizontal" size="xs">
            {actions}
          </SpaceBetween>
        )
      }
    >
      Weather Dashboard
    </Header>
  );
}
