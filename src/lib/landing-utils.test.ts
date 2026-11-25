import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAnnualSavings,
  calculatePlanPrice,
  validateDemoRequest,
} from './landing-utils';

test('calculatePlanPrice returns base monthly price and 20% discounted annual monthly rate', () => {
  assert.equal(calculatePlanPrice('free', 'monthly'), 0);
  assert.equal(calculatePlanPrice('free', 'annual'), 0);
  assert.equal(calculatePlanPrice('pro', 'monthly'), 49);
  assert.equal(calculatePlanPrice('pro', 'annual'), 39);
  assert.equal(calculatePlanPrice('enterprise', 'monthly'), 199);
  assert.equal(calculatePlanPrice('enterprise', 'annual'), 159);
});

test('calculateAnnualSavings computes total yearly dollar savings per tier', () => {
  assert.equal(calculateAnnualSavings('free'), 0);
  assert.equal(calculateAnnualSavings('pro'), 120);
  assert.equal(calculateAnnualSavings('enterprise'), 480);
});

test('validateDemoRequest catches missing fields and malformed email addresses', () => {
  const empty = validateDemoRequest({
    fullName: '',
    workEmail: '',
    companyName: '',
    teamSize: '11-25',
    primaryFocus: 'All Modules',
  });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.fullName);
  assert.ok(empty.errors.workEmail);
  assert.ok(empty.errors.companyName);

  const badEmail = validateDemoRequest({
    fullName: 'Claire Bennett',
    workEmail: 'claire@invalid',
    companyName: 'Northwind Craft',
    teamSize: '11-25',
    primaryFocus: 'Finance & Invoicing',
  });
  assert.equal(badEmail.valid, false);
  assert.equal(badEmail.errors.fullName, undefined);
  assert.ok(badEmail.errors.workEmail);
  assert.equal(badEmail.errors.companyName, undefined);

  const valid = validateDemoRequest({
    fullName: 'Claire Bennett',
    workEmail: 'claire@northwind.co',
    companyName: 'Northwind Craft',
    teamSize: '11-25',
    primaryFocus: 'All Modules',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});
