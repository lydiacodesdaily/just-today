export type BrainDumpStatus = 'unsorted' | 'kept';

export interface BrainDumpItem {
  id: string;
  text: string;
  createdAt: string;
  status: BrainDumpStatus;
  keptAt?: string;
}

export function createBrainDumpItem(text: string): BrainDumpItem {
  const now = new Date().toISOString();
  const randomId = Math.random().toString(36).substr(2, 9);

  return {
    id: `braindump-${Date.now()}-${randomId}`,
    text,
    createdAt: now,
    status: 'unsorted',
  };
}

export function isItemExpired(item: BrainDumpItem): boolean {
  if (item.status === 'kept') {
    return false;
  }

  const createdDate = new Date(item.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  return hoursDiff >= 24;
}
