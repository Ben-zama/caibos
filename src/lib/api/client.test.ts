import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, buildUrl, unwrapResponse } from './client';
import { ENDPOINTS } from './endpoints';

test('buildUrl normalizes slashes and encodes query parameters while skipping empty values', () => {
  assert.equal(
    buildUrl('https://api.example.com/v1///', 'admin/businesses'),
    'https://api.example.com/v1/admin/businesses'
  );

  assert.equal(
    buildUrl('https://api.example.com/v1', '/admin/businesses', {
      search: 'acme',
      plan: 'pro',
      page: 2,
      empty: '',
      missing: undefined,
      nil: null,
    }),
    'https://api.example.com/v1/admin/businesses?search=acme&plan=pro&page=2'
  );

  assert.equal(
    buildUrl('https://api.example.com/v1', 'https://other.example.com/health', { full: true }),
    'https://other.example.com/health?full=true'
  );
});

test('unwrapResponse handles both standard envelope payloads and raw JSON objects', () => {
  const enveloped = {
    success: true,
    message: 'OK',
    data: [{ id: '1', name: 'Acme' }],
    meta: { total: 1 },
  };
  assert.deepEqual(unwrapResponse(enveloped), [{ id: '1', name: 'Acme' }]);

  const rawObject = { id: 'biz-1', name: 'Acme', data: 'custom-field' };
  assert.deepEqual(unwrapResponse(rawObject), rawObject);

  const rawArray = [1, 2, 3];
  assert.deepEqual(unwrapResponse(rawArray), [1, 2, 3]);
});

test('ApiError preserves status, code, and details', () => {
  const err = new ApiError('Unauthorized', 401, 'AUTH_EXPIRED', { reason: 'token_expired' });
  assert.equal(err.name, 'ApiError');
  assert.equal(err.message, 'Unauthorized');
  assert.equal(err.status, 401);
  assert.equal(err.code, 'AUTH_EXPIRED');
  assert.deepEqual(err.details, { reason: 'token_expired' });
});

test('ENDPOINTS safely encodes dynamic path parameters', () => {
  assert.equal(ENDPOINTS.BUSINESSES.BY_ID('biz 001/a'), '/admin/businesses/biz%20001%2Fa');
  assert.equal(ENDPOINTS.BUSINESSES.UPDATE_PLAN('biz-1'), '/admin/businesses/biz-1/plan');
  assert.equal(ENDPOINTS.HR.APPROVE_LEAVE('lv-9'), '/hr/leave-requests/lv-9/approve');
  assert.equal(
    ENDPOINTS.INVENTORY.PURCHASE_ORDER_STATUS('po-42'),
    '/inventory/purchase-orders/po-42/status'
  );
});
