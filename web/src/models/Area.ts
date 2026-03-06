/**
 * Area.ts
 * High-level grouping layer above Projects (GTD Areas of Responsibility).
 * An Area contains multiple Projects. It never contains actions directly.
 */

export interface Area {
  id: string;
  name: string;
  sortOrder: number;
  collapsed: boolean;
  createdAt: string;
}

export function createArea(name: string, sortOrder: number = 0): Area {
  const randomId = Math.random().toString(36).slice(2, 11);
  return {
    id: `area-${Date.now()}-${randomId}`,
    name: name.trim(),
    sortOrder,
    collapsed: false,
    createdAt: new Date().toISOString(),
  };
}

export const UNSORTED_AREA_ID = 'area-unsorted';
