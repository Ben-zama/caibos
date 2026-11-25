import test from 'node:test';
import assert from 'node:assert/strict';
import type { Business } from '@/types';
import {
  applyBusinessPlanUpdate,
  businessesToCsv,
  computePlatformMetrics,
  filterBusinesses,
  getPlanMonthlyPrice,
} from './businesses-utils';

const sampleBusinesses: Business[] = [
  {
    id: 'biz-001',
    name: 'Acme Corp',
    industry: 'Technology',
    plan: 'pro',
    status: 'active',
    ownerId: 'user-owner',
    ownerName: 'John Smith',
    ownerEmail: 'john@acme.com',
    usersCount: 12,
    monthlyRevenue: 49,
    location: 'New York, USA',
    createdAt: '2024-01-15',
  },
  {
    id: 'biz-002',
    name: 'Vanguard Logistics, Inc.',
    industry: 'Supply Chain',
    plan: 'enterprise',
    status: 'active',
    ownerId: 'user-owner-2',
    ownerName: 'Priya Patel',
    ownerEmail: 'priya@vanguard.io',
    usersCount: 40,
    monthlyRevenue: 199,
    location: 'Austin, USA',
    createdAt: '2024-03-20',
  },
  {
    id: 'biz-003',
    name: 'Spark Studio',
    industry: 'Design',
    plan: 'free',
    status: 'trial',
    ownerId: 'user-owner-3',
    ownerName: 'Leo Vance',
    ownerEmail: 'leo@spark.design',
    usersCount: 3,
    monthlyRevenue: 0,
    location: 'London, UK',
    createdAt: '2024-09-01',
  },
  {
    id: 'biz-004',
    name: 'Dormant Retail',
    industry: 'Retail',
    plan: 'pro',
    status: 'suspended',
    ownerId: 'user-owner-4',
    ownerName: 'Maya Lin',
    ownerEmail: 'maya@dormant.shop',
    usersCount: 5,
    monthlyRevenue: 0,
    location: 'Seattle, USA',
    createdAt: '2024-05-10',
  },
];

test('getPlanMonthlyPrice returns configured pricing for each tier', () => {
  assert.equal(getPlanMonthlyPrice('free'), 0);
  assert.equal(getPlanMonthlyPrice('pro'), 49);
  assert.equal(getPlanMonthlyPrice('enterprise'), 199);
});

test('filterBusinesses filters by search, plan, and status accurately', () => {
  assert.equal(
    filterBusinesses(sampleBusinesses, { search: '', plan: 'all', status: 'all' }).length,
    4
  );

  const enterprise = filterBusinesses(sampleBusinesses, {
    search: '',
    plan: 'enterprise',
    status: 'all',
  });
  assert.deepEqual(
    enterprise.map(b => b.id),
    ['biz-002']
  );

  const suspended = filterBusinesses(sampleBusinesses, {
    search: '',
    plan: 'all',
    status: 'suspended',
  });
  assert.deepEqual(
    suspended.map(b => b.id),
    ['biz-004']
  );

  const ownerMatch = filterBusinesses(sampleBusinesses, {
    search: '  priya@vanguard.io ',
    plan: 'all',
    status: 'active',
  });
  assert.deepEqual(
    ownerMatch.map(b => b.id),
    ['biz-002']
  );

  const locationMatch = filterBusinesses(sampleBusinesses, {
    search: 'london',
    plan: 'free',
    status: 'trial',
  });
  assert.deepEqual(
    locationMatch.map(b => b.id),
    ['biz-003']
  );
});

test('computePlatformMetrics aggregates counts, subscriptions, users, and active MRR', () => {
  const metrics = computePlatformMetrics(sampleBusinesses);
  assert.equal(metrics.totalBusinesses, 4);
  assert.equal(metrics.activeBusinesses, 2);
  assert.equal(metrics.trialBusinesses, 1);
  assert.equal(metrics.suspendedBusinesses, 1);
  assert.equal(metrics.activeSubscriptions, 2);
  assert.equal(metrics.monthlyRevenue, 248);
  assert.equal(metrics.totalUsers, 60);
});

test('applyBusinessPlanUpdate recalculates MRR based on plan and status', () => {
  const upgraded = applyBusinessPlanUpdate(sampleBusinesses[0], 'enterprise', 'active');
  assert.equal(upgraded.plan, 'enterprise');
  assert.equal(upgraded.status, 'active');
  assert.equal(upgraded.monthlyRevenue, 199);

  const suspended = applyBusinessPlanUpdate(sampleBusinesses[0], 'enterprise', 'suspended');
  assert.equal(suspended.status, 'suspended');
  assert.equal(suspended.monthlyRevenue, 0);
});

test('businessesToCsv generates valid headers and escapes commas in fields', () => {
  const csv = businessesToCsv(sampleBusinesses.slice(0, 2));
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith('ID,Business Name,Industry'));
  assert.ok(lines[2].includes('"Vanguard Logistics, Inc."'));
  assert.ok(lines[2].includes('"Austin, USA"'));
});
