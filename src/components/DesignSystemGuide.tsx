import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { StatsSkeleton, TableSkeleton } from './ui/Skeleton';

export const DesignSystemGuide: React.FC = () => {
  const [demoLoading, setDemoLoading] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h2>Design System Guide</h2>
        <p className="text-sm text-gray-600">Interactive showcase of core components, states, and visuals.</p>
      </div>

      <Card header={<div className="font-semibold">Buttons</div>}>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
        </div>
      </Card>

      <Card header={<div className="font-semibold">Alerts</div>}>
        <div className="space-y-3">
          <Alert title="Info" message="This is an information alert" tone="info" />
          <Alert title="Success" message="Operation completed" tone="success" />
          <Alert title="Warning" message="Check inputs and try again" tone="warning" />
          <Alert title="Error" message="Something went wrong" tone="error" />
        </div>
      </Card>

      <Card header={<div className="font-semibold">Loading States</div>}>
        <div className="flex items-center gap-6">
          <Spinner label="Fetching data..." />
          <div className="w-full">
            <TableSkeleton rows={5} />
          </div>
        </div>
      </Card>

      <Card header={<div className="font-semibold">Stats Skeleton</div>}>
        <StatsSkeleton />
      </Card>

      <Card header={<div className="font-semibold">Micro-interactions</div>}>
        <div className="flex items-center gap-4">
          <Button onClick={() => { setDemoLoading(true); setTimeout(() => setDemoLoading(false), 1500); }} loading={demoLoading}>
            Save Changes
          </Button>
          <span className="text-sm text-gray-600">Buttons scale subtly on press and show a spinner when loading.</span>
        </div>
      </Card>
    </div>
  );
};

export default DesignSystemGuide;

