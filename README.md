# POS Cloud — Point of Sale System

> A full-stack, cloud-based Point of Sale (POS) web application built for CSCE 331 (Spring 2026) at Texas A&M University.

**Live Demo:** [project3-team30.vercel.app](https://project3-team30.vercel.app)

---

## Overview

This project is a cloud-hosted POS system designed to streamline order management for restaurants similar to ShareTea. It supports multiple user roles (customer, cashier, manager), 
real-time order processing, and dynamic menu management. All features and interfaces are accessible from any browser.

---

## Features

- **Customer View** — Browse the menu and place orders with an intuitive kiosk-style interface
- **Cashier View** — Process transactions, manage orders, and handle payments
- **Manager View** — Add/update/remove menu items, view sales reports, and manage inventory
- **Cloud Deployment** — Hosted on Vercel with a persistent backend database
- **Responsive UI** — Works on desktop and tablet screens

---

## How It Was Made

| Layer | Technology |
|-------|-----------|
| Frontend | React (JavaScript), CSS |
| Backend | Java (Spring Boot) |
| Database | PostgreSQL |
| Package Management | Node.js / npm, Maven |
| Deployment | Vercel |

---

## Project Structure

```
project3-team30/
├── client/             # React frontend application
├── server/             # Java Spring Boot backend API
├── database_updates/   # SQL migration scripts and schema updates
└── package-lock.json
```

---

## Getting Started

```bash
# Frontend
cd client && npm install && npm run dev

# Backend
cd server && mvn spring-boot:run
```

> Requires Node.js 18+, Java 17+, and PostgreSQL. See `database_updates/` for schema setup.

---

## Team

Built by Team 30 as part of CSCE 331 — Foundations of Software Engineering, Spring 2026.

---

## License

This project was created for academic purposes at Texas A&M University.
