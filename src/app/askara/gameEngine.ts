"use client";

import { sound } from "./soundEngine";

// Game time of day types
export type TimeOfDay = "Pagi" | "Siang" | "Sore" | "Malam";

export interface SaveState {
  playerX: number;
  playerY: number;
  playerDir: "down" | "up" | "left" | "right";
  money: number;
  energy: number;
  day: number; // 1 = Senin, 2 = Selasa, etc.
  timeOfDay: TimeOfDay;
  friendship: number;
  romanticInterest: number; // Hidden
  inventory: string[];
  currentQuest: string | null;
  questStep: number;
  storyAct: number; // 1 to 5, 6 = Aftermath, 7 = Departure, 8 = Ended
  flags: Record<string, boolean>;
}

export interface NPC {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  dir: "down" | "up" | "left" | "right";
  color: string;
  hairColor: string;
  visible: boolean;
  scheduleDescription: string;
}

export interface DialogueNode {
  id: string;
  npcName: string;
  text: string;
  choices?: {
    text: string;
    nextNodeId: string;
    effect?: (state: SaveState) => void;
  }[];
  onEnter?: (state: SaveState) => void;
  nextId?: string;
}

// Game Map constants
export const TILE_SIZE = 32;
export const MAP_COLS = 42;
export const MAP_ROWS = 32;

// Map Grid definitions
// 0 = Grass, 1 = Pavement/Path, 2 = River (solid), 3 = Bridge (walkable river), 4 = Fence/Obstacle, 5 = Building walls
export const MAP_GRID: number[][] = [];
for (let r = 0; r < MAP_ROWS; r++) {
  const row: number[] = [];
  for (let c = 0; c < MAP_COLS; c++) {
    // Default grass
    let cell = 0;

    // Outer boundaries
    if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
      cell = 4;
    }
    // Vertical River on the right side
    else if (c === 34 || c === 35) {
      cell = 2; // River water
      // Bridge in the middle
      if (r >= 14 && r <= 16) {
        cell = 3; // Bridge
      }
    }
    // Main horizontal road in middle
    else if (r === 15 || r === 16) {
      cell = 1; // Paved road
    }
    // Vertical roads branching
    else if (c === 8 || c === 22) {
      cell = 1;
    }
    // Station rails (bottom road)
    else if (r === 27 && c > 20) {
      cell = 4; // Rails
    }
    row.push(cell);
  }
  MAP_GRID.push(row);
}

// Define Building coordinates
export interface Building {
  name: string;
  label: string;
  color: string;
  x: number; // grid x
  y: number; // grid y
  w: number; // grid w
  h: number; // grid h
  doorX: number;
  doorY: number;
  description: string;
}

export const BUILDINGS: Building[] = [
  {
    name: "home_immbg",
    label: "Rumah Immbg",
    color: "#4e3629",
    x: 3,
    y: 3,
    w: 4,
    h: 3,
    doorX: 5,
    doorY: 6,
    description: "Rumah sewaan kecilmu. Hangat dan tenang."
  },
  {
    name: "home_askara",
    label: "Rumah Askara",
    color: "#6b3f54",
    x: 13,
    y: 3,
    w: 5,
    h: 3,
    doorX: 15,
    doorY: 6,
    description: "Rumah keluarga Askara. Halamannya penuh bunga melati."
  },
  {
    name: "school",
    label: "SMA Senandika",
    color: "#2b4c6f",
    x: 23,
    y: 3,
    w: 7,
    h: 4,
    doorX: 26,
    doorY: 7,
    description: "Sekolah lokal. Tempat belajar dan bercanda."
  },
  {
    name: "market",
    label: "Pasar Kota",
    color: "#8c7040",
    x: 3,
    y: 10,
    w: 4,
    h: 3,
    doorX: 5,
    doorY: 13,
    description: "Pasar tradisional untuk membeli bahan segar atau bekerja paruh waktu."
  },
  {
    name: "minimarket",
    label: "Mart Senandika",
    color: "#a63333",
    x: 3,
    y: 19,
    w: 4,
    h: 3,
    doorX: 5,
    doorY: 22,
    description: "Minimarket 24 jam tempat pertama kali bertemu Askara."
  },
  {
    name: "cafe",
    label: "Kafe Teduh",
    color: "#5c6d54",
    x: 12,
    y: 19,
    w: 5,
    h: 3,
    doorX: 14,
    doorY: 22,
    description: "Tempat favorit minum kopi hangat dan mendengarkan musik santai."
  },
  {
    name: "station",
    label: "Stasiun Senandika",
    color: "#3f465c",
    x: 26,
    y: 20,
    w: 6,
    h: 4,
    doorX: 29,
    doorY: 24,
    description: "Peron stasiun. Tempat awal kedatangan dan perpisahan akhir."
  }
];

// Write buildings into collisions (MAP_GRID)
BUILDINGS.forEach(b => {
  for (let r = b.y; r < b.y + b.h; r++) {
    for (let c = b.x; c < b.x + b.w; c++) {
      if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
        // Exclude the door tile so player can stand there
        if (c === b.doorX && r === b.doorY - 1) {
          MAP_GRID[r][c] = 1; // Door step is road-like
        } else {
          MAP_GRID[r][c] = 5; // solid wall
        }
      }
    }
  }
});

// Park and river adjustments (special props)
// Let's add trees in the park (around center-left)
const TREES: { x: number; y: number }[] = [
  { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 }, { x: 15, y: 10 },
  { x: 11, y: 12 }, { x: 16, y: 12 },
  { x: 11, y: 13 }, { x: 12, y: 13 }, { x: 15, y: 13 }, { x: 16, y: 13 },
  { x: 26, y: 12 }, { x: 27, y: 12 }, { x: 28, y: 12 },
  // River bank trees
  { x: 33, y: 4 }, { x: 33, y: 8 }, { x: 33, y: 22 }, { x: 33, y: 26 }
];
TREES.forEach(t => {
  if (MAP_GRID[t.y][t.x] === 0) {
    MAP_GRID[t.y][t.x] = 4; // solid obstacle
  }
});

// Cozy bench in the park
const BENCH_X = 20;
const BENCH_Y = 13;
MAP_GRID[BENCH_Y][BENCH_X] = 4; // Solid bench

// Shop Items
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  energyBonus: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "ramen", name: "Ramen Hangat", price: 15000, energyBonus: 40, description: "Ramen kuah pedas yang membangkitkan stamina." },
  { id: "kopi", name: "Kopi Hitam", price: 10000, energyBonus: 25, description: "Kopi hitam pahit favorit Immbg." },
  { id: "kue_cubir", name: "Kue Cubit Manis", price: 8000, energyBonus: 15, description: "Camilan manis kesukaan Askara." },
  { id: "buku_catatan", name: "Buku Catatan", price: 25000, energyBonus: 0, description: "Buku kosong bersampul kulit untuk mencatat rahasia." },
  { id: "kalung_perak", name: "Kalung Perak", price: 100000, energyBonus: 0, description: "Kalung perak berkilau indah. Ingin kamu berikan kepada seseorang." }
];

export const DAYS_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Check if cell is walkable
export function isWalkable(gridX: number, gridY: number): boolean {
  if (gridX < 0 || gridX >= MAP_COLS || gridY < 0 || gridY >= MAP_ROWS) return false;
  const cell = MAP_GRID[gridY][gridX];
  // 0 = Grass, 1 = Path, 3 = Bridge
  return cell === 0 || cell === 1 || cell === 3;
}

// Get day name
export function getDayName(dayIndex: number): string {
  return DAYS_NAMES[dayIndex % 7];
}

// Generate NPC position based on Schedule & Act
export function updateNPCPosition(npc: NPC, state: SaveState) {
  if (state.storyAct >= 8) {
    npc.visible = false;
    return;
  }

  if (npc.id === "askara") {
    // Act 6: Aftermath - Askara is rarely seen and avoids Immbg
    if (state.storyAct === 6) {
      npc.visible = false;
      npc.scheduleDescription = "Sedang berdiam diri di rumah.";
      return;
    }
    // Act 7: Departure - Askara is waiting at the station
    if (state.storyAct === 7) {
      npc.visible = true;
      npc.gridX = 29;
      npc.gridY = 23;
      npc.dir = "down";
      npc.scheduleDescription = "Menunggu kereta di peron stasiun.";
      return;
    }

    // Normal Acts: Scheduled routine
    npc.visible = true;
    switch (state.timeOfDay) {
      case "Pagi":
        // At school
        npc.gridX = 26;
        npc.gridY = 8;
        npc.dir = "down";
        npc.scheduleDescription = "Sedang belajar di gerbang SMA Senandika.";
        break;
      case "Siang":
        // At Cafe
        npc.gridX = 14;
        npc.gridY = 23;
        npc.dir = "right";
        npc.scheduleDescription = "Sedang bersantai di teras Kafe Teduh.";
        break;
      case "Sore":
        // At park bench
        npc.gridX = 21;
        npc.gridY = 13;
        npc.dir = "left";
        npc.scheduleDescription = "Duduk santai di bangku taman kota.";
        break;
      case "Malam":
        // Home
        npc.gridX = 15;
        npc.gridY = 7;
        npc.dir = "up";
        npc.scheduleDescription = "Sudah pulang ke rumahnya.";
        break;
    }
  } else if (npc.id === "raka") {
    // Raka only appears from Act 4 onwards
    if (state.storyAct < 4 || state.storyAct >= 7) {
      npc.visible = false;
      return;
    }

    npc.visible = true;
    // Raka hangs out near Askara, emphasizing their growing closeness
    switch (state.timeOfDay) {
      case "Pagi":
        npc.gridX = 28;
        npc.gridY = 8;
        npc.dir = "left";
        npc.scheduleDescription = "Berbincang dengan Askara di depan sekolah.";
        break;
      case "Siang":
        npc.gridX = 15;
        npc.gridY = 23;
        npc.dir = "left";
        npc.scheduleDescription = "Menemani Askara minum es kopi di Kafe Teduh.";
        break;
      case "Sore":
        npc.gridX = 22;
        npc.gridY = 13;
        npc.dir = "left";
        npc.scheduleDescription = "Duduk bersama Askara di bangku taman.";
        break;
      case "Malam":
        npc.visible = false; // Goes home
        break;
    }
  } else if (npc.id === "penjaga_mart") {
    npc.visible = true;
    npc.gridX = 5;
    npc.gridY = 20;
    npc.dir = "down";
    npc.scheduleDescription = "Menjaga kasir Mart Senandika.";
  } else if (npc.id === "warga_taman") {
    // Just a random town citizen
    npc.visible = true;
    npc.gridX = 20;
    npc.gridY = 18;
    npc.dir = "down";
    npc.scheduleDescription = "Menikmati suasana sejuk Senandika.";
  }
}
