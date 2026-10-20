/**
 * WebData Pro - Data Constants & Seed Configuration
 * 0 completed records initially.
 * Robust pending queue so submitting moves automatically to the next record.
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
  STATE_OPTIONS: [
    'Available',
    'Not Available'
  ],
  CITY_OPTIONS: [
    'Available',
    'Not Available'
  ],
  PRODUCT_COUNT_OPTIONS: ['0', '1', '2', '3'],
  PRODUCT_IMAGE_OPTIONS: ['0', '1', '2', '3'],
  PRODUCT_DESC_OPTIONS: ['0', '1', '2', '3']
};

// Initial completed records start at 0
const SEED_COMPLETED_RECORDS = [];

// Rich queue of pending URLs for continuous data entry
const SEED_PENDING_URLS = [
  'http://www.tas.com',
  'http://www.nexustech.io',
  'http://www.globalequip.de',
  'http://www.apexlogistics.com',
  'http://www.solarmatrix.org',
  'http://www.dynasystems.fr',
  'http://www.orientalchem.com',
  'http://www.precisionforge.in',
  'http://www.valuestream.co.uk',
  'http://www.vortexmaterials.com',
  'http://www.titanpack.ca',
  'http://www.aerocast.it',
  'http://www.bioenergycorp.com',
  'http://www.paramountvalves.net',
  'http://www.stellarcircuits.com',
  'http://www.primetools.com.au',
  'http://www.quantumfilters.ch',
  'http://www.synapseautomation.com',
  'http://www.oceanicseals.sg',
  'http://www.summitsteel.jp',
  'http://www.zenithoptics.com',
  'http://www.metronpackaging.com',
  'http://www.hydraulico.dk',
  'http://www.crystalceramics.es',
  'http://www.beaconlighting.nl',
  'http://www.polymertubes.se',
  'http://www.fusionwelding.com',
  'http://www.kineticsensors.co',
  'http://www.durafiber.co.za',
  'http://www.omnicables.com',
  'http://www.ecoturbine.fi',
  'http://www.novapharma.at',
  'http://www.integrapumps.br',
  'http://www.pinnaclerubber.mx'
];
