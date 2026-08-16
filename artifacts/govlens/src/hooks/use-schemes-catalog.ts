import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getListSchemesQueryKey,
  useListCategories,
  useListMinistries,
  useListSchemes,
} from '@workspace/api-client-react';
import { useMockSchemes } from '@/components/mock-schemes-toggle';
import {
  MOCK_CATEGORIES,
  MOCK_MINISTRIES,
  filterMockSchemes,
  type SchemeFilters,
} from '@/data/mock/schemes';
import { probeApiHealth } from '@/lib/fetch-with-fallback';

export function useSchemesCatalog(filters: SchemeFilters) {
  const { mockEnabled, enableMock, disableMock, toggleMock } = useMockSchemes();

  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: ({ signal }) => probeApiHealth(signal),
    enabled: !mockEnabled,
    retry: 0,
    staleTime: 15_000,
  });

  const apiUp = healthQuery.data === true;
  const liveEnabled = !mockEnabled && apiUp;

  const schemesQuery = useListSchemes(filters, {
    query: {
      queryKey: getListSchemesQueryKey(filters),
      retry: 0,
      enabled: liveEnabled,
    },
  });
  const categoriesQuery = useListCategories({
    query: { retry: 0, enabled: liveEnabled },
  });
  const ministriesQuery = useListMinistries({
    query: { retry: 0, enabled: liveEnabled },
  });

  const liveSchemes = Array.isArray(schemesQuery.data) ? schemesQuery.data : null;
  const liveCategories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : null;
  const liveMinistries = Array.isArray(ministriesQuery.data) ? ministriesQuery.data : null;

  const healthSettled = mockEnabled || !healthQuery.isLoading;
  const apiFailed =
    !mockEnabled &&
    healthSettled &&
    (healthQuery.isError || healthQuery.data === false || schemesQuery.isError || liveSchemes === null);
  const apiEmpty =
    !mockEnabled &&
    liveEnabled &&
    !schemesQuery.isLoading &&
    liveSchemes !== null &&
    liveSchemes.length === 0;

  const usingMock = mockEnabled;
  const schemes = usingMock ? filterMockSchemes(filters) : (liveSchemes ?? []);
  const categories = usingMock ? MOCK_CATEGORIES : (liveCategories ?? []);
  const ministries = usingMock ? MOCK_MINISTRIES : (liveMinistries ?? []);

  const isLoading = usingMock ? false : !healthSettled || (liveEnabled && schemesQuery.isLoading);

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
