import { useCallback, useMemo, useState } from 'react';
import {
  getListSchemesQueryKey,
  useListCategories,
  useListMinistries,
  useListSchemes,
} from '@workspace/api-client-react';
import {
  MOCK_CATEGORIES,
  MOCK_MINISTRIES,
  filterMockSchemes,
  isMockSchemesQueryEnabled,
  setMockSchemesQuery,
  type SchemeFilters,
} from '@/data/mock/schemes';

export function useSchemesCatalog(filters: SchemeFilters) {
  const [mockEnabled, setMockEnabled] = useState(isMockSchemesQueryEnabled);

  const enableMock = useCallback(() => {
    setMockSchemesQuery(true);
    setMockEnabled(true);
  }, []);

  const disableMock = useCallback(() => {
    setMockSchemesQuery(false);
    setMockEnabled(false);
  }, []);

  const toggleMock = useCallback(() => {
    setMockEnabled((prev) => {
      const next = !prev;
      setMockSchemesQuery(next);
      return next;
    });
  }, []);

  const schemesQuery = useListSchemes(filters, {
    query: {
      queryKey: getListSchemesQueryKey(filters),
      retry: 1,
      retryDelay: 400,
      enabled: !mockEnabled,
    },
  });
  const categoriesQuery = useListCategories({
    query: { retry: 1, retryDelay: 400, enabled: !mockEnabled },
  });
  const ministriesQuery = useListMinistries({
    query: { retry: 1, retryDelay: 400, enabled: !mockEnabled },
  });

  const liveSchemes = Array.isArray(schemesQuery.data) ? schemesQuery.data : null;
  const liveCategories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : null;
  const liveMinistries = Array.isArray(ministriesQuery.data) ? ministriesQuery.data : null;

  const apiFailed =
    !mockEnabled &&
    !schemesQuery.isLoading &&
    (schemesQuery.isError || liveSchemes === null);
  const apiEmpty =
    !mockEnabled &&
    !schemesQuery.isLoading &&
    liveSchemes !== null &&
    liveSchemes.length === 0;

  const usingMock = mockEnabled;
  const schemes = usingMock ? filterMockSchemes(filters) : (liveSchemes ?? []);
  const categories = usingMock ? MOCK_CATEGORIES : (liveCategories ?? []);
  const ministries = usingMock ? MOCK_MINISTRIES : (liveMinistries ?? []);

  const isLoading = usingMock ? false : schemesQuery.isLoading;

  return useMemo(
    () => ({
      schemes,
      categories,
      ministries,
      isLoading,
      apiFailed,
      apiEmpty,
      usingMock,
      mockEnabled,
      enableMock,
      disableMock,
      toggleMock,
    }),
    [
      schemes,
      categories,
      ministries,
      isLoading,
      apiFailed,
      apiEmpty,
      usingMock,
      mockEnabled,
      enableMock,
      disableMock,
      toggleMock,
    ],
  );
}
