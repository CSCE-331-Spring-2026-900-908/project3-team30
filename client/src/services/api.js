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
  import.meta.env.VITE_API_BASE_URL;

const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });
};

export const api = {
  async login(pin) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/login?pin=${encodeURIComponent(pin)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },

  async getManagerSummary() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/manager-summary`);
    if (!res.ok) {
      throw new Error('Failed to load manager summary');
    }
    return res.json();
  },

  async saveUser(payload) {
    await sleep();
    const index = localUsers.findIndex((user) => user.code === Number(payload.code));
    const normalized = { ...payload, code: Number(payload.code), role: payload.role };
    if (index >= 0) localUsers[index] = normalized;
    else localUsers.push(normalized);
    return normalized;
  },

  async getUsers() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/manage-employees`);
    if (!res.ok) {
      throw new Error('Failed to load users');
    }
    return res.json();
  },

  async addUser(payload) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/manage-employees/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to save user");
    }
    return;
  },

  async updateUser(payload) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/manage-employees/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update user");
    }
    return;
  },

  async deleteUser(code) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/manage-employees/remove`, {
      method: "DELETE",
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

  async getWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to load weather data');
    }
    return res.json();
  },

  async getMenuDrinks() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/menu-drinks`);
    if (!res.ok) throw new Error("Failed to load drinks");
    return res.json();
  },

  async getMenuToppings() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/menu-toppings`);
    if (!res.ok) throw new Error("Failed to load toppings");
    return res.json();
  },

  async getMenuItems() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/menu-items`);
    if (!res.ok) throw new Error('Failed to load menu items');
    return res.json();
  },

  async saveMenuItem(item) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/menu-drinks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Failed to save menu item");
    return res.json();
  },

  async deleteMenuItem(name) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/menu-drinks/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error("Failed to delete menu item");
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
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/inventory`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Failed to load inventory: HTTP ${res.status}`);
    }
    return res.json();
  },

  async createInventoryItem(payload) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sku: payload.sku,
        name: payload.name,
        retailPrice: Number(payload.retailPrice),
        category: payload.category,
        amtInStock: Number(payload.amtInStock),
        minStockNeeded: Number(payload.minStockNeeded ?? 0),
        unitOfMeasurement: payload.unitOfMeasurement
      })
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Create failed: HTTP ${res.status}: ${text}`);
    }

    if (!res.ok) {
      throw new Error(data?.message || `Failed to create inventory item: HTTP ${res.status}`);
    }

    return data;
  },

  async updateInventoryItem(payload) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/inventory`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sku: payload.sku,
        name: payload.name,
        retailPrice: Number(payload.retailPrice),
        category: payload.category,
        amtInStock: Number(payload.amtInStock),
        minStockNeeded: Number(payload.minStockNeeded ?? 0),
        unitOfMeasurement: payload.unitOfMeasurement
      })
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Update failed: HTTP ${res.status}: ${text}`);
    }

    if (!res.ok) {
      throw new Error(data?.message || `Failed to update inventory item: HTTP ${res.status}`);
    }

    return data;
  },

  async deleteInventoryItem(sku) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/inventory/${encodeURIComponent(sku)}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Failed to delete inventory item: HTTP ${res.status}`);
    }

    return true;
  },

  async getAlterations() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/alterations`);
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

  async getRestockReport() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/reports/restockReport`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to load restock report");
    }
    return res.json();
  },

  async getSalesReport(startDate, endDate) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/reports/salesReport?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to load sales report");
    }

    return res.json();
  },

  async getXReport() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/reports/XReport`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to load X report");
    }
    return res.json();
  },

  async getZReport() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/reports/ZReport`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to load Z report");
    }
    return res.json();
  },

  async getLatestZReport() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/reports/ZReport/latest`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to load latest Z report');
    }
    return res.json();
  },

  async processOrder(order) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to process order');
    return data;
  },

  async cancelOrder(order) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/orders/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
    return data;
  },

  async sendChatMessage(payload) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error(`Server returned status ${res.status} with non-JSON response`);
    }

    if (!res.ok) {
      throw new Error(data.reply || data.message || `HTTP ${res.status}`);
    }

    return data;
  },

  async getActiveOrders() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/kitchen/active`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to load active orders');
    }

    return res.json();
  },

  async getCompletedOrders() {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/kitchen/completed`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to load completed orders');
    }

    return res.json();
  },

  async markComplete(id) {
    const res = await fetchWithCredentials(`${API_BASE_URL}/api/kitchen/${id}/complete`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to update order');
    }

    return;
  },
};
