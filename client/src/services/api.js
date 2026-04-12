import { ingredientMap, inventoryItems, menuItems, reports, users } from './mockData';

const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let localUsers = [...users];
let localMenuItems = [...menuItems];
let localInventory = [...inventoryItems];
let localIngredientMap = structuredClone(ingredientMap);

/**
* This is the API service that calls backend
* @author Jade Azahar
*/

function formatRole(role) {
  return role === 'manager' || role === 'kitchen' ? 'manager' : 'cashier';
}

/**
 * The base URL for the API endpoints, the import is managed by the .env file and defaults to localhost for local testing
 */
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

  /**
   * This method gets the manager summary data for the dashboard
   * @return an object with the manager summary data (total sales, total orders, etc.)
   * @throws an error if the request fails
   */
  async getManagerSummary() {
    const res = await fetch(`${API_BASE_URL}/api/manager-summary`);
    if (!res.ok) {
      throw new Error('Failed to load manager summary');
    }
    return res.json();
  },

  async getUsers() {
    await sleep();
    return [...localUsers];
  },

  async saveUser(payload) {
    await sleep();
    const index = localUsers.findIndex((user) => user.code === Number(payload.code));
    const normalized = { ...payload, code: Number(payload.code), role: payload.role };
    if (index >= 0) localUsers[index] = normalized;
    else localUsers.push(normalized);
    return normalized;
  },

  /**
   * This method gets the list of users for the manage employees page
   * @returns a list of user objects
   * @throws an error if the request fails
   */
  async getUsers() {
    // const res = await fetch("http://localhost:8082/api/manage-employees"); //to run locally
    const res = await fetch(`${API_BASE_URL}/api/manage-employees`);
    if (!res.ok) {
      throw new Error('Failed to load users');
    }
    return res.json();
  },

  /**
   * This method adds a new user to the system
   * @param {*} payload 
   * @returns nothing if successful
   * @thorws an error if the request fails
   */
  async addUser(payload) {
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

  /**
   * This method updates an existing user in the system
   * @param {*} payload 
   * @returns nothing if successful
   * @throws an error if the request fails
   */
  async updateUser(payload) {
    const res = await fetch(`${API_BASE_URL}/api/manage-employees/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok){
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update user");
    }
    return;
  },

  /**
   * This method deletes a user from the system
   * @param {*} code 
   * @returns nothing if successful
   * @throws an error if the request fails
   */
  async deleteUser(code) {
    // const res = await fetch("http://localhost:8082/api/manage-employees/remove", {
    const res = await fetch(`${API_BASE_URL}/api/manage-employees/remove`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to save user');
    }

    return;
  },

  async updateUser(payload) {
    const res = await fetch(`${API_BASE_URL}/api/manage-employees/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to update user');
    }

    return;
  },

  async deleteUser(code) {
    const res = await fetch(`${API_BASE_URL}/api/manage-employees/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to delete user');
    }

    return;
  },

  async getMenuItems() {
    const res = await fetch(`${API_BASE_URL}/api/menu-items`);
    if (!res.ok) throw new Error('Failed to load menu items');
    return res.json();
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

    if (existing >= 0) {
      localMenuItems[existing] = normalized;
    } else {
      localMenuItems.push(normalized);
    }

    if (!localIngredientMap[normalized.name]) {
      localIngredientMap[normalized.name] = [];
    }

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
    const normalized = {
      ingredient: ingredient.ingredient,
      quantityUsed: Number(ingredient.quantityUsed),
    };

    if (idx >= 0) {
      list[idx] = normalized;
    } else {
      list.push(normalized);
    }

    localIngredientMap[name] = list;
    return normalized;
  },

  async deleteIngredientForMenuItem(name, ingredientName) {
    await sleep();
    localIngredientMap[name] = (localIngredientMap[name] ?? []).filter(
      (entry) => entry.ingredient !== ingredientName
    );
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

    if (idx >= 0) {
      localInventory[idx] = normalized;
    } else {
      localInventory.push(normalized);
    }

    return normalized;
  },

  async deleteInventoryItem(sku) {
    await sleep();
    localInventory = localInventory.filter((item) => item.sku !== sku);
    return true;
  },

  async getAlterations() {
    const res = await fetch(`${API_BASE_URL}/api/alterations`);
    if (!res.ok) throw new Error('Failed to load alterations');

    const data = await res.json();

    return {
      default: data.defaults ?? [],
      sweetness: data.sweetness ?? [],
      ice: data.ice ?? [],
    };
  },

  async getReports() {
    return {
      sales: null,
      xReport: null,
      zReport: null,
      restock: null,
    };
  },
  
  // async getRestockReport(){},
  /**
   * This method gets the restock report data for all inventory items that are below their minimum stock needed
   * @throws an error if the request fails
   * @returns the restock report data for all inventory items that are below their minimum stock needed
   * takes no parameters since the restock report is always for all items below minimum stock needed
   */
  async getRestockReport() {
    const res = await fetch(`${API_BASE_URL}/api/reports/restockReport`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to load restock report");
    }
    return res.json();
  },

  /**
   * This method gets the sales report for a given date range
   * @param {*} startDate 
   * @param {*} endDate 
   * @returns the sales report data for the given date range
   * @throws an error if the request fails
   */
  async getSalesReport(startDate, endDate){
    const res = await fetch(`${API_BASE_URL}/api/reports/salesReport?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to load sales report");
    }

    return res.json();;
  },

  /**
   * This method gets the X report for the current day
   * @returns the X report data for the current day
   * @throws an error if the request fails
   * takes no parameters since the X report is always for the current day
   */
  async getXReport(){
    const res = await fetch(`${API_BASE_URL}/api/reports/XReport`);
    if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to load X report");
    }
    return res.json();;
  },

  /**
   * This method gets the Z report for the current day
   * @returns the Z report data for the current day
   * @throws an error if the request fails
   * takes no parameters since the Z report is always for the current day
   */
  async getZReport(){
    const res = await fetch(`${API_BASE_URL}/api/reports/ZReport`);
    if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to load Z report");
    }
    return res.json();;
  },

  /**
   * This method gets the latest Z report
   * @returns the latest Z report data
   * @throws an error if the request fails
   */
  async getLatestZReport() {
    const res = await fetch(`${API_BASE_URL}/api/reports/ZReport/latest`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to load latest Z report');
    }
    return res.json();
  },
  
  async getRestockReport() {
    // placeholder until backend endpoint is implemented
    return null;
  },

  async getSalesReport(startDate, endDate) {
    const res = await fetch(
      `${API_BASE_URL}/api/reports/salesReport?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to load sales report');
    }

    return res.json();
  },

  async getXReport() {
    // placeholder until backend endpoint is implemented
    return null;
  },

  async getZReport() {
    // placeholder until backend endpoint is implemented
    return null;
  },

  async processOrder(order) {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to process order');
    return data;
  },

  async cancelOrder(order) {
    const res = await fetch(`${API_BASE_URL}/api/orders/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
    return data;
  },
  async getActiveOrders() {
    const res = await fetch(`${API_BASE_URL}/api/orders/active`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to load active orders');
    }

    return res.json();
  },
};