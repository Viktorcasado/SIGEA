# SIGEA - AI Development Rules

## Tech Stack
- **React 19 & TypeScript**: Core framework for building a type-safe, modern user interface.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS 4**: Utility-first CSS framework for all styling needs.
- **React Router 7**: Handles all client-side navigation and routing.
- **Supabase**: Used for Authentication, Database (PostgreSQL), and Storage.
- **Lucide React**: The standard library for all iconography.
- **Motion**: Used for creating smooth UI animations and transitions.
- **jsPDF & QRCode**: Specifically for generating and validating digital certificates.
- **React IMask**: For handling masked inputs like CPF and phone numbers.

## Library Usage Rules

### 1. Styling & UI Components
- **Tailwind CSS**: Always use Tailwind utility classes for styling. Avoid writing custom CSS in `index.css` unless it's for global base styles or complex animations not easily handled by Tailwind.
- **Shadcn/UI**: Use pre-installed Shadcn/UI components for common elements (Buttons, Dialogs, Inputs, etc.). Do not reinvent basic UI components.

### 2. Icons
- **Lucide React**: Use only Lucide icons for consistency. Import them individually to keep bundle sizes small.

### 3. Routing
- **React Router**: All routes must be defined in `src/App.tsx`. Use `NavLink` for navigation bars to benefit from active state styling.

### 4. State Management
- **React Context**: Use Context API for global application state (e.g., `UserContext`, `NotificationContext`).
- **Local State**: Use `useState` and `useMemo` for component-level logic.

### 5. Backend & Data
- **Supabase**: Use the Supabase client for all database queries and authentication flows. Do not create separate backend services unless strictly necessary.
- **Repositories**: Abstract data logic into repository files (e.g., `src/repositories/`) to keep components clean and facilitate testing/mocking.

### 6. Forms & Inputs
- **Masking**: Use `react-imask` for any field requiring a specific format (CPF, SIAPE, Dates, Phone).
- **Validation**: Implement client-side validation before submitting to Supabase.

### 7. Animations
- **Motion**: Use the `motion` library for any entrance animations, layout transitions, or interactive feedback. Keep animations subtle and purposeful.

### 8. File Structure
- **Pages**: Place full-page components in `src/pages/`.
- **Components**: Place reusable UI pieces in `src/components/`.
- **Contexts**: Place React Context providers in `src/contexts/`.
- **Types**: Keep all TypeScript interfaces and types in `src/types/index.ts`.