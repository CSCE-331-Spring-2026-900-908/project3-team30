import { alterations, ingredientMap, inventoryItems, menuItems, reports, salesSummary, users } from './mockData';

const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let localUsers = [...users];
let localMenuItems = [...menuItems];
let localInventory = [...inventoryItems];
let localIngredientMap = structuredClone(ingredientMap);

function formatRole(role) {
  return role === 'manager' || 'kitchen' ? 'manager' : 'cashier';
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = {
  async login(pin) {
    const res = await fetch(`${API_BASE_URL}/api/login?pin=${encodeURIComponent(pin)}`);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },
  async getManagerSummary() {
    const res = await fetch(`${API_BASE_URL}/api/manager-summary`);
    if (!res.ok) {
      throw new Error('Failed to load manager summary');
    }
    return res.json();
  },
  async getUsers() {
    // const res = await fetch("http://localhost:8082/api/manage-employees"); //to run locally
    const res = await fetch(`${API_BASE_URL}/api/manage-employees`);
    if (!res.ok) throw new Error("Failed to load users");
    return res.json();
  },
  async addUser(payload) {
    // await sleep();
    // const index = localUsers.findIndex((user) => user.code === Number(payload.code));
    // const normalized = { ...payload, code: Number(payload.code), role: payload.role };
    // if (index >= 0) localUsers[index] = normalized;
    // else localUsers.push(normalized);
    // return normalized;
    // const res = await fetch(`${API_BASE_URL}/api/manage-employees`);
    const res = await fetch(`${API_BASE_URL}/api/manage-employees/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok){
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to save user");
    }
    return;
  },
  async deleteUser(code) {
    // const res = await fetch("http://localhost:8082/api/manage-employees/remove", {
    const res = await fetch(`${API_BASE_URL}/api/manage-employees/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });
    if (!res.ok){
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to delete user");
    }
    return;
  },
  async getMenuItems() {
    await sleep();
    return [...localMenuItems];
  },
  async saveMenuItem(payload) {
    await sleep();
    const existing = localMenuItems.findIndex((item) => item.name === payload.name || item.id === payload.id);
    const normalized = {
      id: payload.id ?? Date.now(),
      name: payload.name,
      price: Number(payload.price),
      category: payload.category,
    };
    if (existing >= 0) localMenuItems[existing] = normalized;
    else localMenuItems.push(normalized);
    if (!localIngredientMap[normalized.name]) localIngredientMap[normalized.name] = [];
    return normalized;
  },
  async deleteMenuItem(name) {
    await sleep();
    localMenuItems = localMenuItems.filter((item) => item.name !== name);
    delete localIngredientMap[name];
    return true;
  },
  async getIngredientsForMenuItem(name) {
    await sleep();
    return [...(localIngredientMap[name] ?? [])];
  },
  async saveIngredientForMenuItem(name, ingredient) {
    await sleep();
    const list = localIngredientMap[name] ?? [];
    const idx = list.findIndex((entry) => entry.ingredient === ingredient.ingredient);
    const normalized = { ingredient: ingredient.ingredient, quantityUsed: Number(ingredient.quantityUsed) };
    if (idx >= 0) list[idx] = normalized; else list.push(normalized);
    localIngredientMap[name] = list;
    return normalized;
  },
  async deleteIngredientForMenuItem(name, ingredientName) {
    await sleep();
    localIngredientMap[name] = (localIngredientMap[name] ?? []).filter((entry) => entry.ingredient !== ingredientName);
    return true;
  },
  async getInventory() {
    await sleep();
    return [...localInventory];
  },
  async saveInventoryItem(payload) {
    await sleep();
    const idx = localInventory.findIndex((item) => item.sku === payload.sku);
    const normalized = {
      ...payload,
      retailPrice: Number(payload.retailPrice),
      amtInStock: Number(payload.amtInStock),
      minStockNeeded: Number(payload.minStockNeeded ?? 0),
    };
    if (idx >= 0) localInventory[idx] = normalized; else localInventory.push(normalized);
    return normalized;
  },
  async deleteInventoryItem(sku) {
    await sleep();
    localInventory = localInventory.filter((item) => item.sku !== sku);
    return true;
  },
  async getAlterations() {
    await sleep();
    return alterations;
  },
  async getReports() {
    await sleep();
    return reports;
  },
  async getRestockItems() {
    await sleep();
    return localInventory.filter((item) => item.amtInStock < item.minStockNeeded);
  },
  async processOrder(order) {
    await sleep();
    return {
      confirmationNumber: Math.floor(Math.random() * 100000),
      paymentMethod: order.paymentMethod,
      total: order.total,
    };
  },
};
