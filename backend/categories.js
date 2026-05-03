const CATEGORIES = {
  'plumbers': {
    name: 'Plumbers',
    selectors: [{ craft: 'plumber' }, { shop: 'plumber' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b5f'],
  },
  'electricians': {
    name: 'Electricians',
    selectors: [{ craft: 'electrician' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b52'],
  },
  'hvac': {
    name: 'HVAC',
    selectors: [{ craft: 'hvac' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b56'],
  },
  'roofers': {
    name: 'Roofers',
    selectors: [{ craft: 'roofer' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b61'],
  },
  'carpenters': {
    name: 'Carpenters',
    selectors: [{ craft: 'carpenter' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b4d'],
  },
  'painters': {
    name: 'Painters',
    selectors: [{ craft: 'painter' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b5d'],
  },
  'landscapers': {
    name: 'Landscapers',
    selectors: [
      { landuse: 'landscaping' },
      { shop: 'garden_centre' },
      { craft: 'gardener' },
    ],
    fsqCategoryIds: ['63be6904847c3692a84b9b5b'],
  },
  'dentists': {
    name: 'Dentists',
    selectors: [{ amenity: 'dentist' }, { healthcare: 'dentist' }],
    fsqCategoryIds: ['4bf58dd8d48988d178941735'],
  },
  'chiropractors': {
    name: 'Chiropractors',
    selectors: [{ healthcare: 'chiropractor' }],
    fsqCategoryIds: ['52e81612bcbc57f1066b7a3a'],
  },
  'veterinarians': {
    name: 'Veterinarians',
    selectors: [{ amenity: 'veterinary' }],
    fsqCategoryIds: ['4d954af4a243a5684765b473'],
  },
  'hair-salons': {
    name: 'Hair salons',
    selectors: [{ shop: 'hairdresser' }, { shop: 'beauty' }],
    fsqCategoryIds: ['4bf58dd8d48988d110951735'],
  },
  'nail-salons': {
    name: 'Nail salons',
    selectors: [{ shop: 'beauty' }, { leisure: 'spa' }],
    fsqCategoryIds: ['4f04aa0c2fb6e1c99f3db0b8'],
  },
  'massage-spa': {
    name: 'Massage / spa',
    selectors: [{ shop: 'massage' }, { leisure: 'spa' }],
    fsqCategoryIds: ['4bf58dd8d48988d1ed941735', '52f2ab2ebcbc57f1066b8b3c'],
  },
  'restaurants': {
    name: 'Restaurants',
    selectors: [{ amenity: 'restaurant' }],
    fsqCategoryIds: ['4d4b7105d754a06374d81259'],
  },
  'cafes': {
    name: 'Cafes',
    selectors: [{ amenity: 'cafe' }],
    fsqCategoryIds: ['4bf58dd8d48988d16d941735', '4bf58dd8d48988d1e0931735'],
  },
  'bakeries': {
    name: 'Bakeries',
    selectors: [{ shop: 'bakery' }],
    fsqCategoryIds: ['4bf58dd8d48988d16a941735'],
  },
  'auto-repair': {
    name: 'Auto repair',
    selectors: [{ shop: 'car_repair' }, { craft: 'car_repair' }],
    fsqCategoryIds: ['52f2ab2ebcbc57f1066b8b44'],
  },
  'auto-detailing': {
    name: 'Auto detailing',
    selectors: [{ shop: 'car' }, { service: 'car_detailing' }],
    fsqCategoryIds: ['4f04ae1f2fb6e1c99f3db0ba'],
  },
  'tattoo-shops': {
    name: 'Tattoo shops',
    selectors: [{ shop: 'tattoo' }],
    fsqCategoryIds: ['4bf58dd8d48988d1de931735'],
  },
  'pet-groomers': {
    name: 'Pet groomers',
    selectors: [{ shop: 'pet_grooming' }, { shop: 'pet' }],
    fsqCategoryIds: ['63be6904847c3692a84b9b79'],
  },
};

const CATEGORY_GROUPS = {
  'beauty-spa': {
    name: 'Beauty & spa',
    categories: ['hair-salons', 'nail-salons', 'massage-spa'],
  },
  'trades': {
    name: 'Trades & contractors',
    categories: ['plumbers', 'electricians', 'hvac', 'roofers', 'carpenters', 'painters', 'landscapers'],
  },
  'health': {
    name: 'Health & wellness',
    categories: ['dentists', 'chiropractors', 'veterinarians'],
  },
  'food': {
    name: 'Food & drink',
    categories: ['restaurants', 'cafes', 'bakeries'],
  },
  'auto': {
    name: 'Auto services',
    categories: ['auto-repair', 'auto-detailing'],
  },
  'all': {
    name: 'All categories',
    categories: Object.keys(CATEGORIES),
  },
};

function getCategory(key) {
  const cat = CATEGORIES[key];
  if (!cat) {
    throw new Error(`Unknown category "${key}". Valid keys: ${Object.keys(CATEGORIES).join(', ')}`);
  }
  return { key, ...cat };
}

function getCategoryGroup(key) {
  const group = CATEGORY_GROUPS[key];
  if (!group) {
    throw new Error(`Unknown category group "${key}". Valid keys: ${Object.keys(CATEGORY_GROUPS).join(', ')}`);
  }
  return { key, ...group };
}

function listCategories() {
  const groups = Object.entries(CATEGORY_GROUPS).map(([key, { name, categories }]) => ({
    key: `group:${key}`,
    name: `${name} (${categories.length})`,
    isGroup: true,
  }));
  const cats = Object.entries(CATEGORIES).map(([key, { name }]) => ({ key, name, isGroup: false }));
  return [...groups, ...cats];
}

module.exports = { CATEGORIES, CATEGORY_GROUPS, getCategory, getCategoryGroup, listCategories };

if (require.main === module) {
  const list = listCategories();
  console.log(`${list.length} categories defined:\n`);
  for (const { key, name } of list) {
    const cat = getCategory(key);
    console.log(`  ${name.padEnd(18)} [${key}]`);
    console.log(`    FSQ ids: ${cat.fsqCategoryIds.join(', ')}`);
  }
}
