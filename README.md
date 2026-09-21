# 🌸 AlgoVision • Created by Crabrian
> **Interactive Problem Statement & Custom Testcase Visualizer for Competitive Programming**

AlgoVision is a **100% Client-Side** web application designed to help competitive programmers and algorithm enthusiasts (LeetCode, Codeforces, VNOJ, AtCoder, CSES, etc.) instantly comprehend complex problem statements and witness step-by-step testcase execution through vibrant, interactive visual simulations.

---

## ⚡ Core Architecture & Workflow

AlgoVision is not a dry theoretical lecture, nor does it generate long-winded text about $O(n)$ or $O(n^2)$ complexity. **At its heart, AlgoVision is a closed-loop Visual State Machine**:

```
+-------------------------------------------------------------------------+
|                                USER INPUT                               |
|  1. Screenshot problem statement (Ctrl + V) or paste Raw Text           |
|  2. (Optional) Provide sample input/output or custom testcase           |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|               GENERATOR: GEMINI 3.5 FLASH LITE / 3.8 FLASH              |
|  - Extracts key data structures & topological relationships             |
|  - Selects the optimal renderer (Tree, Grid, Graph, Intervals, etc.)    |
|  - Transforms sample execution into a sequence of JSON State Frames     |
+-------------------------------------------------------------------------+
                                    │
                                    ▼ (Initial Simulation Draft)
+-------------------------------------------------------------------------+
|             CODE VERIFIER: DETERMINISTIC LOGIC ENGINE (0ms)             |
|  - Strictly matches computed output against expected sample output      |
|  - Scans entity semantics (prevents hallucinations like LAN vs buckets) |
|  - Verifies structural integrity of trees, graphs, grids, and arrays    |
|  - ON MISMATCH: Automatically feeds back to AI to self-correct!         |
+-------------------------------------------------------------------------+
                                    │
                                    ▼ (Passed Verification)
+-------------------------------------------------------------------------+
|                      ALGOVISION RENDERING ENGINE                        |
|  - Dispatches frame data to specialized visualizer components           |
|  - Frame-by-frame player (Play / Pause / Next / Prev / Speed Control)   |
|  - Interactive node dragging for graph topologies                       |
|  - Live testing with direct input override in the header inputs         |
+-------------------------------------------------------------------------+
```

### 1. 100% Client-Side & Secure API Key
- Runs entirely in your browser (React + TypeScript + Vite + Tailwind CSS).
- **No Backend Server:** Your Gemini API Key is stored strictly in your browser's `localStorage` and sent directly via encrypted HTTPS to Google Gemini API. Your credentials are never stored or logged on third-party servers.

### 2. Dual-Engine: AI Generator + Zero-Token Deterministic Logic Verifier
- **Generator (Gemini 3.5 Flash Lite / 3.8 Flash):** Reads problem screenshots or text and produces detailed frame-by-frame simulations.
- **Deterministic Verifier (0ms, 0 tokens, hallucination-free):** Validates the exact output, cross-checks problem keywords to ensure correct data models, and enforces topological integrity. If any discrepancy is found, the system requests AI self-reflection and re-computation.

### 3. Sample Input / Output Priority & Custom Testcases
- **User-Provided Inputs:** If you enter custom sample input or output, the system **100% guarantees** the simulation runs on your exact testcase.
- **Automatic Fallback:** If left blank, the AI parses the problem image/text to extract **Sample 1** automatically.

---

## 🎨 Supported Visualization Modes

AlgoVision automatically determines and activates the optimal renderer for your problem:

### 1. 🌳 Hierarchical Tree (Top-Down Layout)
- **Best for:** Rooted trees, binary trees, DFS/BFS traversals, LCA, subtree queries, tree DP.
- **Highlights:** Dynamic subtree width calculation to prevent overlaps, automatic root identification (`rootId`, not defaulting to node 1), glowing highlights for traversed paths.

### 2. 🔲 2D Grid & Matrix
- **Best for:** Maze traversal, word search, bounding boxes, 2D dynamic programming, flood fill.
- **Highlights:** Complete coordinate axes, cell status coloring (`comparing`, `found`, `swapping`), bounding box highlights.

### 3. 📏 Intervals & Number Line
- **Best for:** Interval scheduling, interval merging, coordinate compression, sweep-line algorithms.
- **Highlights:** Horizontal axis with calibrated scale, non-overlapping vertically stacked interval bars.

### 4. 🕸️ Graph, DSU & Shortest Paths (with Interactive Node Dragging)
- **Best for:** General graphs, Dijkstra, BFS, Disjoint Set Union (Kruskal), cycles, Josephus ring.
- **Highlights:** 
  - Group color-coding for DSU components.
  - Shortest path glow.
  - **"Interactive Drag" toggle:** Allows users to freely click and drag any node across the canvas in real-time, dynamically updating all connected edges, curved parallel links, and labels.

### 5. 📊 1D Array & Dynamic Pointers
- **Best for:** Binary search, two pointers, sliding window, sorting.
- **Highlights:** Animated pointer markers (`left`, `right`, `mid`, `i`, `j`), variable inspector watch-table.

### 6. 🏺 Containers, Water Basins & Knapsack
- **Best for:** Water pouring puzzles, container capacity transfers, 0/1 knapsack, volume simulations.

---

## ✨ Design & Visual Features

### 🍎 Apple Liquid Glass Interface
- Inspired by Apple VisionOS / macOS glassmorphism.
- **Adjustable Transparency Slider:** Customize card opacity from 15% (ultra-translucent glass) to 95% (solid).
- Specular edge lighting, dynamic `backdrop-filter` blur, and a real-time preview panel in the Settings modal.

### 🌍 Internationalization (i18n)
- Seamless multi-language support:
  - 🇻🇳 **Tiếng Việt** (Vietnamese)
  - 🇬🇧 **English** (English)
  - 🇨🇳 **简体中文** (Simplified Chinese)
- **Automatic detection:** Automatically matches your browser's preferred language upon first visit.

### 🎮 24 Dynamic Pixel Art Themes
Choose from 24 pixel art landscapes rendered on a 60 FPS Canvas:
1. **Anime Sky:** Multi-layered pixel clouds drifting across a vibrant pastel horizon.
2. **Summer Meadow:** Towering leafy oak tree and wildflowers; wind gusts blow green leaves every 20s.
3. **Autumn Meadow:** Golden grasses, bonsai-style red maple tree with swirling spiral leaves.
4. **Winter Snowscape:** Heavy snow-capped pine tree, knit-beanie snowman, falling snowflakes.
5. **Sakura Grand Bloom:** Magnificent corner-spanning cherry blossom tree cascading pink petals across the screen.
6. **Cyberpunk Rain:** Neon city skyline with tangled wires, blinking LED signs, and slanted raindrops with puddle splashes.
7. **Retro Coast (Synthwave Sunset):** Giant striped sun, rhythmic ocean waves, and perspective grid lines.
8. **Enchanted Forest:** Ancient mossy trees, glowing mushrooms, and floating fireflies with soft halos.
9. **Desert Oasis & Stars:** Golden dunes, reflecting oasis pool, and shooting stars every 25s.
10. **Cosmic Nebula:** Space station dome viewport overlooking a swirling spiral nebula with blinking console LEDs.
11. **Cozy Library:** Bookshelves framing a stone fireplace with dancing flames and rising embers.
12. **Mystic Swamp:** Murky waters, glowing rune stones, crawling mist, and popping swamp bubbles.
13. **Rainy Cafe:** Windowpane streaked with raindrops, steaming coffee mug, and cozy ambient light.
14. **Mountain Peak:** Snowy alpine ridges overlooking rolling sea of clouds with a soaring eagle.
15. **Tropical Ocean:** Turquoise waters, gentle foam waves washing ashore, and swimming sea turtles.
16. **Lighthouse Coast:** Coastal cliffs with a rotating 360-degree lighthouse beacon cutting through the dark sea.
17. **Tokyo Neon Night:** Glowing Tokyo Tower with a Shinkansen bullet train gliding across an elevated track.
18. **Shanghai Bund:** Oriental Pearl Tower with color-shifting spheres reflecting on the Huangpu River.
19. **Seoul Namsan Night:** N Seoul Tower atop Namsan hill, traditional Hanok tiled eaves, and city light trails.
20. **HUST Parabol Gate:** Iconic parabolic arch of Hanoi University of Science and Technology with ancient mahogany trees and golden leaves.
21. **Ha Long Bay:** Limestone karst peaks rising from emerald water with traditional brown-sailed junk boats.
22. **Hoi An Lantern Town:** Ancient yellow merchant facades adorned with hanging multicolored silk lanterns.
23. **Atlantis Deep Sea:** Submerged marble columns, refracted sunbeams (caustics), and schools of pixel fish.
24. **Aurora Borealis:** Waving green and violet aurora curtains across starry Arctic skies above snowy pines and frozen lakes.

---

## 🔑 Getting a Free Gemini API Key (Takes 1 Minute)

1. Navigate to: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Log in with your Google account.
3. Click **"Create API key"**.
4. Copy the generated key (starts with `AIzaSy...`).
5. Open **AlgoVision**, click the **Settings (⚙️)** or **API Key** button in the top right, paste your key, and click **Save**.

---

## 🚀 Local Development & Deployment

### 1. Local Setup
```bash
# Clone the repository
git clone https://github.com/Crablegit/algo-visualizer.git
cd algo-visualizer

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Deploy to Vercel (100% Free)
1. Push your code to your GitHub repository.
2. Sign in to [vercel.com](https://vercel.com) with GitHub.
3. Click **"Add New..."** $\rightarrow$ **"Project"** $\rightarrow$ Select `algo-visualizer`.
4. Vercel automatically detects the Vite configuration. Click **"Deploy"** with zero environment variables needed.

---

## 👨‍💻 Author

Developed by **Crabrian**  
GitHub: [https://github.com/Crablegit](https://github.com/Crablegit)
