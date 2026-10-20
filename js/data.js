/**
 * WebData Pro - Data Constants & Initial Clean Seed
 * All initial completed records set to 0 as requested by the user.
 * Product counts, Image Product, and Product Description options set to 0, 1, 2, 3.
 */

const APP_CONSTANTS = {
  WEBSITE_STATUSES: [
    'Working',
    'Not Working',
    'Domain Expired',
    'Non English',
    'Under Construction',
    'Flash Site',
    'Redirect Site'
  ],
  BUSINESS_TYPES: [
    'Manufacturer',
    'Industrial Services',
    'Exporter',
    'Trader',
    'Distributer',
    'Supplier',
    'Wholesaler',
    'Service Provider',
    'Online Shopping',
    'Restricted Site',
    'Other'
  ],
  COMPANY_PROFILES: [
    'Available',
    'Not Available'
  ],
  PRODUCT_COUNT_OPTIONS: ['0', '1', '2', '3'],
  PRODUCT_IMAGE_OPTIONS: ['0', '1', '2', '3'],
  PRODUCT_DESC_OPTIONS: ['0', '1', '2', '3']
};

// All items start at ZERO as requested
const SEED_COMPLETED_RECORDS = [];

// Clean initial pending URLs queue
const SEED_PENDING_URLS = [
  'http://www.tas.com',
  'http://www.nexustech.io',
  'http://www.globalequip.de',
  'http://www.apexlogistics.com',
  'http://www.solarmatrix.org'
];
