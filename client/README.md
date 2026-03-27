# Project 2 React Frontend

This is a web-ready React conversion of the original JavaFX/FXML frontend from the uploaded `projectgui` project.

## What was converted

The following desktop screens were mapped into React routes:

- `login.fxml` → `/login`
- `managerDashboard.fxml` → `/manager`
- `cashierDashboard.fxml` → `/cashier`
- `menu.fxml` + `modifications.fxml` → `/cashier/menu`
- `checkout.fxml` → `/cashier/checkout`
- `manageEmployees.fxml` → `/manager/employees`
- `manageMenu.fxml` → `/manager/menu`
- `ingredientEditor.fxml` → `/manager/menu/:itemName/ingredients`
- `inventory.fxml` → `/manager/inventory`
- `salesAndTrends.fxml` → `/manager/reports`
- `salesReport.fxml` → `/manager/reports/sales`
- `xreport.fxml` → `/manager/reports/x`
- `zreport.fxml` → `/manager/reports/z`
- `restockReport.fxml` → `/manager/reports/restock`

## Important note about backend

The original JavaFX app talked directly to PostgreSQL from the frontend controllers. A hosted React app should **not** do that.

So this conversion uses a service layer in `src/services/api.js` and mock data in `src/services/mockData.js`.

That means:

- the frontend is now web-appropriate
- the UI, routing, forms, and state flow are converted
- the database logic still needs to be moved behind a backend API before production hosting

## Suggested production architecture

- React frontend hosted on Vercel, Netlify, or similar
- Backend API hosted separately using Node/Express, Spring Boot, or another server
- PostgreSQL connection handled only by the backend

## API shape to implement later

The React app is already structured so you can replace the mock service with real HTTP calls.

Recommended endpoints:

- `POST /api/auth/pin-login`
- `GET /api/dashboard/manager-summary`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:code`
- `DELETE /api/users/:code`
- `GET /api/menu-items`
- `POST /api/menu-items`
- `PUT /api/menu-items/:id`
- `DELETE /api/menu-items/:name`
- `GET /api/menu-items/:name/ingredients`
- `POST /api/menu-items/:name/ingredients`
- `DELETE /api/menu-items/:name/ingredients/:ingredientName`
- `GET /api/inventory`
- `POST /api/inventory`
- `PUT /api/inventory/:sku`
- `DELETE /api/inventory/:sku`
- `GET /api/reports/sales`
- `GET /api/reports/x`
- `GET /api/reports/z`
- `GET /api/reports/restock`
- `POST /api/orders`

## Local run

```bash
npm install
npm run dev
```

## Mock login PINs

- Manager: `1111`
- Cashier: `2222`
- Cashier: `3333`

## Where to start editing

- routes: `src/App.jsx`
- auth/session: `src/context/AuthContext.jsx`
- cart state: `src/context/CartContext.jsx`
- backend adapter: `src/services/api.js`
- mock data: `src/services/mockData.js`
- styling: `src/styles/app.css`
