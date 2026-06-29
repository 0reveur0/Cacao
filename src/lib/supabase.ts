/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const createQueryBuilder = (table: string) => {
  const rows: Array<Record<string, unknown>> = [];

  const query: any = {
    table,
    select: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
    single: async () => ({ data: rows[0] ?? null, error: null }),
    insert: async (payload: unknown) => {
      const value = Array.isArray(payload) ? payload : [payload];
      value.forEach((item) => rows.push(item as Record<string, unknown>));
      return { data: value, error: null };
    },
    update: async () => ({ data: rows, error: null }),
    delete: async () => ({ data: rows, error: null }),
  };

  return query;
};

export const supabase: any = {
  from: (table: string) => createQueryBuilder(table),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } }, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signInWithOAuth: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  },
  removeChannel: () => undefined,
};
