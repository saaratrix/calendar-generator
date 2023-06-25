import type { Month } from './month';
import type { SelectedResolution } from './selected-resolution';

export interface LocalWorkspaceItem {
  months: Month[];
  canvasWidth: number;
  canvasHeight: number;
  selectedResolution: SelectedResolution;
}