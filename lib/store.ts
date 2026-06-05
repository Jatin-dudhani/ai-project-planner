"use client";

import type { ProjectBrief } from "./types";

const STORAGE_KEY = "ai-project-planner-brief";

export function saveBrief(brief: ProjectBrief): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brief));
  } catch {
    console.error("Failed to save brief to localStorage");
  }
}

export function loadBrief(): ProjectBrief | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectBrief;
  } catch {
    return null;
  }
}

export function clearBrief(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Failed to clear brief from localStorage");
  }
}
