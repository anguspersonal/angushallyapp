'use client';

import { useCallback, useEffect, useState } from 'react';
import { habitClient } from './client';
import type {
  HabitDetail,
  HabitListParams,
  HabitListResult,
  HabitSummary,
  HabitPeriod,
  HabitStats,
} from '@shared/services/habit/contracts';

export function useHabits(params?: HabitListParams) {
  const [state, setState] = useState<{
    data: HabitSummary[];
    pagination?: HabitListResult['pagination'];
    isLoading: boolean;
    error?: string;
  }>({
    data: [],
    isLoading: true,
    pagination: undefined,
  });

  useEffect(() => {
    let active = true;
    habitClient
      .getHabits(params)
      .then((result) => {
        if (!active) return;
        setState({ data: result.items, pagination: result.pagination, isLoading: false });
      })
      .catch((error: Error & { code?: string }) => {
        if (!active) return;
        setState({ data: [], pagination: undefined, isLoading: false, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [params?.page, params?.pageSize]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    habitClient
      .getHabits(params)
      .then((result) => setState({ data: result.items, pagination: result.pagination, isLoading: false }))
      .catch((error: Error & { code?: string }) =>
        setState({ data: [], pagination: undefined, isLoading: false, error: error.message }),
      );
  }, [params]);

  return { ...state, reload };
}

export function useHabit(id: string | number | undefined) {
  const [state, setState] = useState<{ data: HabitDetail | null; pagination?: undefined; isLoading: boolean; error?: string }>(
    {
      data: null,
      isLoading: Boolean(id),
      pagination: undefined,
    },
  );

  useEffect(() => {
    let active = true;
    if (!id) {
      setState({ data: null, isLoading: false, pagination: undefined });
      return undefined;
    }

    habitClient
      .getHabitById(id)
      .then((result) => {
        if (!active) return;
        setState({ data: result, isLoading: false, pagination: undefined });
      })
      .catch((error: Error & { code?: string }) => {
        if (!active) return;
        setState({ data: null, isLoading: false, pagination: undefined, error: error.message });
      });

    return () => {
      active = false;
    };
  }, [id]);

  return state;
}

export function useHabitStats(period: HabitPeriod | undefined) {
  const [state, setState] = useState<{ data: HabitStats | null; pagination?: undefined; isLoading: boolean; error?: string }>(
    {
      data: null,
      isLoading: Boolean(period),
      pagination: undefined,
    },
  );

  useEffect(() => {
    let active = true;
    if (!period) {
      setState({ data: null, isLoading: false, pagination: undefined });
      return undefined;
    }

    habitClient
      .getStats(period)
      .then((result) => {
        if (!active) return;
        setState({ data: result, isLoading: false, pagination: undefined });
      })
      .catch((error: Error & { code?: string }) => {
        if (!active) return;
        setState({ data: null, isLoading: false, pagination: undefined, error: error.message });
      });

    return () => {
      active = false;
    };
  }, [period]);

  return state;
}
