export const users = [
  { code: 1111, firstName: 'Alice', lastName: 'Manager', role: 'manager' },
  { code: 2222, firstName: 'Ben', lastName: 'Cashier', role: 'cashier' },
  { code: 3333, firstName: 'Cara', lastName: 'Cashier', role: 'cashier' },
];

export const menuItems = [
  { id: 1, name: 'Classic Milk Tea', price: 4.5, category: 'Milk Tea' },
  { id: 2, name: 'Taro Slush', price: 5.25, category: 'Slush' },
  { id: 3, name: 'Mango Green Tea', price: 4.95, category: 'Fruit Tea' },
  { id: 4, name: 'Thai Tea', price: 4.75, category: 'Milk Tea' },
];

export const ingredientMap = {
  'Classic Milk Tea': [
    { ingredient: 'Black Tea', quantityUsed: 1 },
    { ingredient: 'Milk Base', quantityUsed: 1 },
    { ingredient: 'Boba', quantityUsed: 1 },
  ],
  'Taro Slush': [
    { ingredient: 'Taro Powder', quantityUsed: 1 },
    { ingredient: 'Ice', quantityUsed: 2 },
  ],
  'Mango Green Tea': [
    { ingredient: 'Green Tea', quantityUsed: 1 },
    { ingredient: 'Mango Syrup', quantityUsed: 1 },
  ],
  'Thai Tea': [
    { ingredient: 'Thai Tea Mix', quantityUsed: 1 },
    { ingredient: 'Creamer', quantityUsed: 1 },
  ],
};

export const inventoryItems = [
  { sku: 'ING-101', name: 'Black Tea', retailPrice: 10.5, category: 'Tea', amtInStock: 16, minStockNeeded: 10, unitOfMeasurement: 'bags' },
  { sku: 'ING-102', name: 'Milk Base', retailPrice: 18, category: 'Dairy', amtInStock: 8, minStockNeeded: 10, unitOfMeasurement: 'bottles' },
  { sku: 'ING-103', name: 'Boba', retailPrice: 13.75, category: 'Topping', amtInStock: 6, minStockNeeded: 12, unitOfMeasurement: 'bags' },
  { sku: 'ING-104', name: 'Mango Syrup', retailPrice: 12, category: 'Syrup', amtInStock: 14, minStockNeeded: 8, unitOfMeasurement: 'bottles' },
];

export const alterations = {
  default: [
    { name: 'No Ice', price: 0 },
    { name: 'Less Ice', price: 0 },
    { name: 'Extra Boba', price: 0.75 },
    { name: 'Cheese Foam', price: 1.0 },
  ],
  sweetness: [
    { name: '0% Sugar', price: 0 },
    { name: '50% Sugar', price: 0 },
    { name: '100% Sugar', price: 0 },
  ],
};

export const salesSummary = {
  ordersToday: 42,
  revenueToday: 238.4,
  topItem: 'Classic Milk Tea',
  activeEmployees: 3,
};

export const reports = {
  productUsage: [
    { ingredient: 'Black Tea', totalUsed: 82 },
    { ingredient: 'Boba', totalUsed: 74 },
    { ingredient: 'Milk Base', totalUsed: 63 },
    { ingredient: 'Mango Syrup', totalUsed: 31 },
  ],
  sales: {
    totalRevenue: 4821.52,
    totalOrders: 913,
    avgOrderValue: 5.28,
    bestSeller: 'Classic Milk Tea',
  },
  xReport: {
    totalCash: 112.75,
    totalCard: 125.65,
    numSales: 42,
    numCancelled: 2,
    numVoided: 1,
    lastRun: '2026-03-26 09:35:00',
  },
  zReport: {
    totalCash: 910.2,
    totalCard: 1298.7,
    numSales: 387,
    numCancelled: 9,
    numVoided: 3,
    lastRun: '2026-03-25 22:05:00',
  },
};
