import { fetchProgress, getStoredToken, isBackendConfigured, saveProgressBulk, saveProgressItem } from "./api";
import { wcagCriteria } from "../data/wcag/criteria";

export function progressStorageKey(criterionId: string) {
  return `a11y-audit-${criterionId}`;
}

export function readLocalProgress(criterionId: string): Record<string, boolean> {
  const raw = localStorage.getItem(progressStorageKey(criterionId));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function writeLocalProgress(criterionId: string, progress: Record<string, boolean>) {
  localStorage.setItem(progressStorageKey(criterionId), JSON.stringify(progress));
  window.dispatchEvent(new Event("a11y-progress-update"));
}

export async function saveProgress(criterionId: string, itemKey: string, completed: boolean) {
  const local = readLocalProgress(criterionId);
  writeLocalProgress(criterionId, { ...local, [itemKey]: completed });

  if (!isBackendConfigured() || !getStoredToken()) return;

  try {
    await saveProgressItem(criterionId, itemKey, completed);
  } catch (error) {
    console.warn("Remote progress sync failed; local progress was kept.", error);
  }
}

export async function hydrateProgressFromBackend() {
  if (!isBackendConfigured() || !getStoredToken()) return;

  const remoteItems = await fetchProgress();
  const grouped: Record<string, Record<string, boolean>> = {};

  remoteItems.forEach((item) => {
    grouped[item.criterion_id] = grouped[item.criterion_id] || {};
    grouped[item.criterion_id][item.item_key] = item.completed;
  });

  Object.entries(grouped).forEach(([criterionId, progress]) => {
    writeLocalProgress(criterionId, progress);
  });
}

export async function syncLocalProgressToBackend() {
  if (!isBackendConfigured() || !getStoredToken()) return;

  const items = wcagCriteria.flatMap((criterion) => {
    const progress = readLocalProgress(criterion.id);
    return Object.entries(progress).map(([itemKey, completed]) => ({
      criterion_id: criterion.id,
      item_key: itemKey,
      completed,
    }));
  });

  if (items.length > 0) {
    await saveProgressBulk(items);
  }
}
