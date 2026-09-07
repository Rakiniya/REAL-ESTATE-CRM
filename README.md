# EstateFlow – Real Estate CRM

EstateFlow is a full-stack Real Estate CRM application designed to help sales teams manage leads, properties, follow-ups, employees, and bookings from a single platform.

The application provides role-based access for **Admin** and **Sales Employees**, with a responsive SaaS-style interface and REST APIs built using FastAPI.

---

## Features

### Authentication & Authorization

* Secure login using JWT authentication
* Role-based access for Admin and Sales Employees
* Protected frontend routes
* Backend permission validation

### Lead Management

* Create and update leads
* Search and manage customer information
* Track lead stages:

  * New
  * Contacted
  * Site Visit
  * Interested
  * Negotiation
  * Booked
  * Lost
* Assign leads to sales employees
* Add lead notes
* Track follow-up dates

### Property Management

* Manage real estate projects
* Manage buildings under projects
* Manage individual property units
* Store unit type, price and availability
* View available and booked units

### Booking Management

* Create bookings by connecting a lead with a property unit
* Cancel bookings
* Prevent multiple users from booking the same available unit simultaneously
* Maintain booking history
* Automatically update unit availability

### Dashboard

* Lead statistics
* Lead pipeline overview
* Property availability
* Booking information
* Follow-up information
* Sales performance overview

---

## Technology Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide React
* React Hot Toast

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Password Hashing

### Database

* PostgreSQL

---

## Project Structure

```text
estateflow/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd estateflow
```

---

## Backend Setup

Open a terminal inside the `backend` folder.

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

**Windows:**

```powershell
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/estateflow
SECRET_KEY=your_secret_key
```

Update the database credentials according to your local PostgreSQL setup.

### Start Backend

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```text
http://127.0.0.1:8000
```

FastAPI Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Open another terminal inside the `frontend` folder.

### Install Packages

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## Database Overview

EstateFlow uses **PostgreSQL** as the relational database.

### Main Tables

| Table      | Purpose                                  |
| ---------- | ---------------------------------------- |
| Users      | Stores Admin and Sales Employee accounts |
| Leads      | Stores customer lead information         |
| Lead Notes | Stores notes related to leads            |
| Projects   | Stores real estate projects              |
| Buildings  | Stores buildings belonging to projects   |
| Units      | Stores individual property units         |
| Bookings   | Stores customer property bookings        |

### Main Relationships

```text
Project
   │
   └── Buildings
          │
          └── Units
                 │
                 └── Bookings
                        │
                        └── Lead
```

Users are also associated with leads for sales employee assignment.

---

## API Overview

The backend provides REST APIs using FastAPI.

| API          | Purpose                  |
| ------------ | ------------------------ |
| `/auth`      | Authentication and login |
| `/leads`     | Lead management          |
| `/projects`  | Project management       |
| `/buildings` | Building management      |
| `/units`     | Property unit management |
| `/bookings`  | Booking management       |
| `/employees` | Employee management      |
| `/dashboard` | Dashboard statistics     |

Detailed API documentation is available through FastAPI Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## User Roles

### Admin

Admin users can:

* View dashboard
* Manage employees
* Manage leads
* Manage properties
* Manage bookings
* Access administrative features

### Sales Employee

Sales employees can:

* View dashboard
* Manage assigned leads
* Add notes and follow-ups
* View available properties
* Create and manage bookings according to permissions

---

## Application Flow

```text
Login
  ↓
Dashboard
  ↓
Leads → Follow-ups → Customer Interest
  ↓
Properties → Project → Building → Unit
  ↓
Booking
  ↓
Booking Confirmation
```

---

## Key Design Decisions

* **Role-based access:** Admin and Sales Employee permissions are handled at both frontend and backend levels.
* **Booking consistency:** The backend validates booking availability to prevent conflicting bookings.
* **Booking history:** Cancelled bookings are retained instead of being deleted.
* **Reusable components:** Common UI elements and API services are organized for easier maintenance.
* **Responsive design:** The interface is designed to work across desktop, tablet and mobile screen sizes.

---

## Running the Application

Run both services simultaneously:

**Terminal 1 – Backend**

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

Then open the frontend URL shown by Vite in the browser.

---

## Project

**EstateFlow – Real Estate CRM**

A full-stack CRM solution demonstrating frontend development, REST API design, PostgreSQL database integration, authentication, role-based authorization, and real-world property booking workflows.
