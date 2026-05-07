import { describe, it, expect, vi } from 'vitest';
import { HttpError } from './httpError';
import { listPaginated } from './listQuery';

interface QueryResult {
  data: unknown[] | null;
  error: { message: string } | null;
  count: number | null;
}

interface QueryStub {
  query: unknown;
  orderCalls: () => Array<[string, { ascending: boolean }]>;
  rangeCalls: () => Array<[number, number]>;
}

function makeQueryStub(result: QueryResult): QueryStub {
  const order = vi.fn(
    (..._args: [string, { ascending: boolean }]) => undefined as unknown,
  );
  const range = vi.fn((..._args: [number, number]) =>
    Promise.resolve(result),
  );
  const query = { order, range };
  order.mockImplementation(() => query);
  return {
    query,
    orderCalls: () => order.mock.calls,
    rangeCalls: () => range.mock.calls,
  };
}

describe('listPaginated — pagination math', () => {
  it('uses defaults (page 1, pageSize 10) when params are empty', async () => {
    const stub = makeQueryStub({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i })),
      error: null,
      count: 25,
    });

    const result = await listPaginated(stub.query as never, {}, {
      defaultSortColumn: 'created_at',
      errorContext: 'thing',
    });

    expect(stub.rangeCalls()[0]).toEqual([0, 9]);
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 25,
      totalPages: 3,
      hasMore: true,
    });
    expect(result.rows).toHaveLength(10);
  });

  it('computes offset and hasMore for a middle page', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 25 });
    const result = await listPaginated(
      stub.query as never,
      { page: 2, pageSize: 10 },
      { defaultSortColumn: 'created_at', errorContext: 'thing' },
    );
    expect(stub.rangeCalls()[0]).toEqual([10, 19]);
    expect(result.pagination.hasMore).toBe(true);
  });

  it('reports hasMore=false on the last page', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 25 });
    const result = await listPaginated(
      stub.query as never,
      { page: 3, pageSize: 10 },
      { defaultSortColumn: 'created_at', errorContext: 'thing' },
    );
    expect(result.pagination.hasMore).toBe(false);
  });

  it('returns totalPages=0 when there are no items', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    const result = await listPaginated(stub.query as never, {}, {
      defaultSortColumn: 'created_at',
      errorContext: 'thing',
    });
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasMore).toBe(false);
  });

  it('falls back to row count when Supabase count is null', async () => {
    const stub = makeQueryStub({
      data: [{ id: 1 }, { id: 2 }],
      error: null,
      count: null,
    });
    const result = await listPaginated(stub.query as never, {}, {
      defaultSortColumn: 'created_at',
      errorContext: 'thing',
    });
    expect(result.pagination.totalItems).toBe(2);
  });
});

describe('listPaginated — page/pageSize clamping', () => {
  it('clamps pageSize above the max', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(
      stub.query as never,
      { pageSize: 9999 },
      { defaultSortColumn: 'created_at', errorContext: 'thing' },
    );
    // pageSize clamps to 50, so range is [0, 49]
    expect(stub.rangeCalls()[0]).toEqual([0, 49]);
  });

  it('clamps pageSize 0 / negative / non-numeric to default 10', async () => {
    for (const bad of [0, -5, NaN, undefined as unknown as number]) {
      const stub = makeQueryStub({ data: [], error: null, count: 0 });
      await listPaginated(
        stub.query as never,
        { pageSize: bad },
        { defaultSortColumn: 'created_at', errorContext: 'thing' },
      );
      expect(stub.rangeCalls()[0]).toEqual([0, 9]);
    }
  });

  it('clamps page 0 / negative to default 1', async () => {
    for (const bad of [0, -3, NaN]) {
      const stub = makeQueryStub({ data: [], error: null, count: 0 });
      await listPaginated(
        stub.query as never,
        { page: bad },
        { defaultSortColumn: 'created_at', errorContext: 'thing' },
      );
      expect(stub.rangeCalls()[0]).toEqual([0, 9]);
    }
  });
});

describe('listPaginated — sort allowlisting', () => {
  it('applies the default column when no sortBy is given', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(stub.query as never, {}, {
      defaultSortColumn: 'created_at',
      errorContext: 'thing',
    });
    expect(stub.orderCalls()[0][0]).toBe('created_at');
  });

  it('translates an allowed alias to the DB column', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(
      stub.query as never,
      { sortBy: 'createdAt' },
      {
        sortAllowlist: { createdAt: 'created_at', title: 'title' },
        defaultSortColumn: 'id',
        errorContext: 'thing',
      },
    );
    expect(stub.orderCalls()[0][0]).toBe('created_at');
  });

  it('falls back to the default column when sortBy is not in the allowlist', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(
      stub.query as never,
      { sortBy: 'evil_drop_table' },
      {
        sortAllowlist: { createdAt: 'created_at' },
        defaultSortColumn: 'id',
        errorContext: 'thing',
      },
    );
    expect(stub.orderCalls()[0][0]).toBe('id');
  });

  it('uses defaultAscending when order is not provided', async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(stub.query as never, {}, {
      defaultSortColumn: 'created_at',
      defaultAscending: true,
      errorContext: 'thing',
    });
    expect(stub.orderCalls()[0][1]).toEqual({ ascending: true });
  });

  it("explicit order: 'asc' overrides defaultAscending=false", async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(
      stub.query as never,
      { order: 'asc' },
      { defaultSortColumn: 'created_at', defaultAscending: false, errorContext: 'thing' },
    );
    expect(stub.orderCalls()[0][1]).toEqual({ ascending: true });
  });

  it("explicit order: 'desc' overrides defaultAscending=true", async () => {
    const stub = makeQueryStub({ data: [], error: null, count: 0 });
    await listPaginated(
      stub.query as never,
      { order: 'desc' },
      { defaultSortColumn: 'created_at', defaultAscending: true, errorContext: 'thing' },
    );
    expect(stub.orderCalls()[0][1]).toEqual({ ascending: false });
  });
});

describe('listPaginated — error handling', () => {
  it('throws HttpError(500) tagged with the errorContext on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const stub = makeQueryStub({
      data: null,
      error: { message: 'boom' },
      count: null,
    });
    await expect(
      listPaginated(stub.query as never, {}, {
        defaultSortColumn: 'created_at',
        errorContext: 'thing',
      }),
    ).rejects.toBeInstanceOf(HttpError);
    await expect(
      listPaginated(stub.query as never, {}, {
        defaultSortColumn: 'created_at',
        errorContext: 'thing',
      }),
    ).rejects.toMatchObject({ status: 500, message: 'Failed to list thing' });
    consoleError.mockRestore();
  });
});
