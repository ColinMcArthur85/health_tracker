# Health Journal 🌿

A holistic health tracking application built with **Next.js 15**, **PostgreSQL (Prisma)**, and the custom **Antigravity Design System**.

## 🚀 Overview

Health Journal allows users to track their physical, mental, and internal health evolution over time. It aggregates data from workouts, sleep, nutrition, and daily reflections into a unified dashboard, powered by AI for deeper insights.

### Key Features

*   **📊 Holistic Dashboard**: Real-time overview of Body, Mind, and Internal health metrics.
*   **🎨 Antigravity Design System**: Premium, dark-mode-first UI with glass-morphism, "light from the sky" shadows, and smooth micro-interactions.
*   **📸 AI Photo Evolution**: Upload progress photos (Front/Side/Back) and get AI-powered analysis of muscle balance and posture.
*   **🧠 Intelligent Insights**: Correlate sleep, workouts, and nutrition data to find patterns.
*   **⚡ High Performance**: Optimized with parallel database queries, indexing, and edge-ready caching.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4 + Antigravity Design System (CSS Variables)
*   **Database**: PostgreSQL (via Neon / Vercel Postgres)
*   **ORM**: Prisma
*   **AI**: OpenAI GPT-4o (Vision & Text)
*   **Storage**: Vercel Blob
*   **Deployment**: Vercel

---

## 🏁 Getting Started

### Prerequisites

*   Node.js 18+
*   PostgreSQL Database URL
*   OpenAI API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/health-journal.git
    cd health-journal
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory:
    ```env
    DATABASE_URL="postgresql://..."
    OPENAI_API_KEY="sk-..."
    BLOB_READ_WRITE_TOKEN="vercel_blob_..."
    ```

4.  **Initialize the database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🎨 Design System

The **Antigravity Design System** is defined in `app/globals.css`. It uses a rigorous set of CSS variables for consistent theming.

*   **Colors**: Brand-saturated grays (`--color-background`), Emerald primary (`--primary-500`).
*   **Shadows**: Multi-layer "elevated" shadows (`--shadow-lg`).
*   **Typography**: Fluid type scale.
*   **Components**: `.card`, `.btn-primary`, `.glass`.

---

## 🧪 Testing

Run the full test suite (Unit & Integration):

```bash
npm test
```

---

## 🚢 Deployment

The application is optimized for deployment on [Vercel](https://vercel.com). Code is automatically built and optimized.

```bash
npm run build
```

---

## 📄 License

Private / Proprietary.
