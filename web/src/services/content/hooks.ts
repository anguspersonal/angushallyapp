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
  error?: string | undefined;
  isLoading: boolean;
}

function listLoadedState(result: ContentListResult): ListState {
  return { data: result.items, pagination: result.pagination, isLoading: false };
}

function listErrorState(error: Error): ListState {
  return { data: [], pagination: undefined, isLoading: false, error: error.message };
}

function postLoadedState(post: ContentPostDetail | null): PostState {
  return { data: post, isLoading: false, pagination: undefined };
}

function postErrorState(error: Error): PostState {
  return { data: null, isLoading: false, pagination: undefined, error: error.message };
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
        setState(listLoadedState(result));
      })
      .catch((error: Error & { code?: string }) => {
        if (!isActive) return;
        setState(listErrorState(error));
      });

    return () => {
      isActive = false;
    };
  }, [params?.page, params?.pageSize, params?.order, params?.sortBy]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    contentClient
      .getPosts(params)
      .then((result) => setState(listLoadedState(result)))
      .catch((error: Error & { code?: string }) => setState(listErrorState(error)));
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
        setState(postLoadedState(post));
      })
      .catch((error: Error & { code?: string }) => {
        if (!isActive) return;
        setState(postErrorState(error));
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
