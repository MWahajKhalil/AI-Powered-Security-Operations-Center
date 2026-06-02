# Apex Guard - Frontend

This is the user interface for our Security Operations Center (SOC) Dashboard, built using **Next.js**, **TypeScript**, and **Vanilla CSS Modules** for premium glassmorphic visual aesthetics.

---

## 🚀 How to Run the Frontend Safely

To ensure your laptop runs smoothly and never runs out of memory, we utilize **`pnpm`** and limit the Node.js process to a maximum of 2GB RAM container.

### Start the Development Server
From inside this `/frontend` directory, run:
```bash
NODE_OPTIONS="--max-old-space-size=2048" pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the active dashboard command console!

---

## 🎨 Design Aesthetics & Visual Tokens

The frontend uses a custom-crafted Cyberpunk/Obsidian styling system located in `src/app/globals.css`:
*   **obsidian backdrop (`#080C14`)**: Creates a deep, technical base.
*   **Cyan & Magenta glows (`#00F2FE` / `#FF007F`)**: Directs analyst focus.
*   **Backdrop filters (`blur(12px)`)**: Applies custom glass panels.
*   **Visual animations**: Glowing pulsing terminal tracks, active agent wave loading structures, and smooth UI entry transitions.

---

## 🛠️ Operational Commands Reference

| Operation | Command |
| :--- | :--- |
| **Run Dev Server** | `NODE_OPTIONS="--max-old-space-size=2048" pnpm dev` |
| **Production Build** | `NODE_OPTIONS="--max-old-space-size=2048" pnpm build` |
| **Format & Lint** | `pnpm lint` |
