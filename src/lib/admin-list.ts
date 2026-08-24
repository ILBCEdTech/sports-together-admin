export type AdminListMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type AdminListResponse<T> = {
  data: T[];
  meta: AdminListMeta;
};

export type AdminListPayload<T> = AdminListResponse<T> | T[];

export function normalizeAdminListPayload<T>(payload: AdminListPayload<T> | null | undefined): AdminListResponse<T> {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: { page: 1, pageSize: Math.max(payload.length, 1), total: payload.length, pageCount: 1 },
    };
  }

  if (!payload) {
    return { data: [], meta: { page: 1, pageSize: 20, total: 0, pageCount: 1 } };
  }

  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta ?? { page: 1, pageSize: 20, total: 0, pageCount: 1 },
  };
}
