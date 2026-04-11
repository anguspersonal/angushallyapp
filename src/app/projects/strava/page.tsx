'use client';

import { useState, useEffect } from 'react';
import { LineChart } from '@mantine/charts';
import { Title } from '@mantine/core';
import { fetchStravaData, getPRs, getWeeklyRuns, getRecentRuns } from './strava';
import { PRTable } from './components/PRTable';
import { RecentRunsTable } from './components/RecentRunsTable';
import type { StravaActivity, StravaPR, WeeklyRunData } from '@/types/common';
import styles from './strava.module.css';

export default function StravaPage() {
  const [prs, setPRs] = useState<StravaPR[]>([]);
  const [weeklyRuns, setWeeklyRuns] = useState<WeeklyRunData[]>([]);
  const [recentRuns, setRecentRuns] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await fetchStravaData();
        setPRs(getPRs(fetchedData));
        setWeeklyRuns(getWeeklyRuns(fetchedData));
        setRecentRuns(getRecentRuns(fetchedData));
      } catch (error) {
        console.error('Error loading Strava data:', error);
        setError('Failed to load Strava data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles['strava-dashboard']}>
        <div className={styles.dashboard}>
          <Title order={1} className={styles['dashboard-header']}>Strava</Title>
          <div>Loading Strava data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['strava-dashboard']}>
        <div className={styles.dashboard}>
          <Title order={1} className={styles['dashboard-header']}>Strava</Title>
          <div style={{ color: 'red' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['strava-dashboard']}>
      <div className={styles.dashboard}>
        <Title order={1} className={styles['dashboard-header']}>Strava</Title>
        <div className={styles['dashboard-content']}>
          <section className={styles.card}>
            <Title order={4}>Personal Records (PRs)</Title>
            <PRTable prs={prs} />
          </section>
          <section className={styles.card}>
            <Title order={4}>Recent Activities</Title>
            <RecentRunsTable recentRuns={recentRuns} />
          </section>
        </div>
      </div>
      <section className={styles['dashboard-chart']}>
        <LineChart
          h={300}
          data={weeklyRuns}
          dataKey="preciseDate"
          valueFormatter={(value) => new Intl.NumberFormat('en-US').format(Math.round(value))}
          series={[{ name: 'totalDistance', color: 'primary' }]}
          yAxisLabel="Distance (m)"
        />
      </section>
    </div>
  );
} 