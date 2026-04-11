import type { MigrationUnavailableFeature } from './migrationUnavailable';
import { migrationInProgressResponse } from './migrationUnavailable';

export function createMigrationUnavailableGetHandler(feature: MigrationUnavailableFeature) {
  return function GET() {
    return migrationInProgressResponse(feature);
  };
}
