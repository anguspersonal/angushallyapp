'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { contentClient } from './client';
import type {
  ContentListParams,
  ContentListResult,
  ContentPostDetail,
  ContentPostSummary,
} from '@shared/services/content/contracts';

interface ListState {
  data: ContentPostSummary[];
  pagination?: ContentListResult['pagination'];
  error?: string;
  isLoading: boolean;
}

interface PostState {
  data: ContentPostDetail | null;
  pagination?: undefined;
  error?: string;
  isLoading: boolean;
}

export function usePosts(params?: ContentListParams) {
  const [state, setState] = useState<ListState>({ data: [], isLoading: true, pagination: undefined });

  useEffect(() => {
    let isActive = true;
    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    contentClient
      .getPosts(params)
      .then((result) => {
        if (!isActive) return;
        setState({ data: result.items, pagination: result.pagination, isLoading: false });
      })
      .catch((error: Error & { code?: string }) => {
        if (!isActive) return;
        setState({ data: [], pagination: undefined, isLoading: false, error: error.message });
      });

    return () => {
      isActive = false;
    };
  }, [params?.page, params?.pageSize, params?.order, params?.sortBy]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    contentClient
      .getPosts(params)
      .then((result) => setState({ data: result.items, pagination: result.pagination, isLoading: false }))
      .catch((error: Error & { code?: string }) =>
        setState({ data: [], pagination: undefined, isLoading: false, error: error.message }),
      );
  }, [params]);

  return { ...state, reload };
}

export function usePost(slug: string | undefined) {
  const [state, setState] = useState<PostState>({ data: null, isLoading: Boolean(slug), pagination: undefined });

  useEffect(() => {
    let isActive = true;
    if (!slug) {
      setState({ data: null, isLoading: false, pagination: undefined });
      return undefined;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

    contentClient
      .getPostBySlug(slug)
      .then((post) => {
        if (!isActive) return;
        setState({ data: post, isLoading: false, pagination: undefined });
      })
      .catch((error: Error & { code?: string }) => {
        if (!isActive) return;
        setState({ data: null, isLoading: false, pagination: undefined, error: error.message });
      });

    return () => {
      isActive = false;
    };
  }, [slug]);

  return state;
}

export function useLatestPost() {
  const { data, isLoading, error } = usePosts({ pageSize: 1, page: 1, sortBy: 'createdAt', order: 'desc' });
  return useMemo(
    () => ({
      post: data[0] ?? null,
      isLoading,
      error,
    }),
    [data, error, isLoading],
  );
}

export function usePostShare(post?: Pick<ContentPostSummary, 'title' | 'slug' | 'excerpt'> | null) {
  return useCallback(() => {
    if (!post) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.excerpt ?? undefined,
          url: `/blog/${post.slug}`,
        })
        .catch(() => {
          // Ignore share cancellation/errors for now
        });
    }
  }, [post]);
}
