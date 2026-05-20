# Clinic Appointment Booking System

A premium, state-of-the-art clinic management system built with React, Vite, and Vanilla CSS.

## Features

- **Role-Based Access Control (RBAC)**: Distinct dashboards for Admin, Doctor, and Patient roles.
- **Premium Aesthetics**: Glassmorphism design, smooth gradients, and Framer Motion animations.
- **Appointment Management**:
    - **Patient**: Book appointments with specific doctors, view history.
    - **Doctor**: Manage daily schedule, confirm/complete appointments.
    - **Admin**: Full visibility, user management, and system stats.
- **Real-time Interactions**: Search, filtering by status, and pagination.
- **Persistent Storage**: Uses `localStorage` to keep data between sessions.

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Vanilla CSS (Premium Design System)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

1. Navigate to the project directory:
   ```bash
   cd "Web Project"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Folder Structure

- `src/context`: State management for Auth and Appointments.
- `src/components`: Reusable UI components and role-specific views.
- `src/index.css`: Global design system and premium styles.
