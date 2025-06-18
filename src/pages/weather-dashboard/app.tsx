// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useRef, useState } from 'react';

import { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { Breadcrumbs, Notifications } from '../commons';
import { CustomAppLayout } from '../commons/common-components';
import { Content } from './components/content';
import { WeatherDashboardHeader } from './components/header';

export function App() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const appLayout = useRef<AppLayoutProps.Ref>(null);

  return (
    <CustomAppLayout
      ref={appLayout}
      content={
        <SpaceBetween size="m">
          <WeatherDashboardHeader
            actions={
              <Button variant="primary" iconName="refresh" onClick={() => window.location.reload()}>
                Refresh Dashboard
              </Button>
            }
          />
          <Content />
        </SpaceBetween>
      }
      breadcrumbs={
        <Breadcrumbs
          items={[
            { text: 'Dashboard', href: '#/' },
            { text: 'Weather Dashboard', href: '#/weather-dashboard' },
          ]}
        />
      }
      navigation={<div></div>}
      toolsHide={true}
      notifications={<Notifications />}
      navigationHide={true}
    />
  );
}
