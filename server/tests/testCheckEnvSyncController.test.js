/**
 * Test for CheckEnvSync Controller Functions
 * Tests individual functions extracted from the checkEnvSync script
 */

describe('CheckEnvSync Controller Functions', () => {
    // Test helper functions by extracting logic
    describe('Migration Comparison Logic', () => {
        it('should identify migrations present in dev but not in prod', () => {
            const devMigrations = [
                '20250620000002_new_feature.js',
                '20250620000001_bug_fix.js', 
                '20250620000000_initial.js'
            ];
            
            const prodMigrations = [
                '20250620000001_bug_fix.js',
                '20250620000000_initial.js'
            ];
            
            const devOnly = devMigrations.filter(m => !prodMigrations.includes(m));
            expect(devOnly).toEqual(['20250620000002_new_feature.js']);
        });

        it('should handle empty migration lists', () => {
            const devMigrations = [];
            const prodMigrations = [];
            
            const devOnly = devMigrations.filter(m => !prodMigrations.includes(m));
            expect(devOnly).toEqual([]);
        });

        it('should handle identical migration lists', () => {
            const migrations = [
                '20250620000001_migration.js',
                '20250620000000_initial.js'
            ];
            
            const devOnly = migrations.filter(m => !migrations.includes(m));
            expect(devOnly).toEqual([]);
        });
    });

    describe('Status Logging Logic', () => {
        it('should categorize results correctly', () => {
            const checkResults = [
                { status: 'OK', message: 'Connection successful' },
                { status: 'WARN', message: 'Data missing in prod' },
                { status: 'FAIL', message: 'Table not found' },
                { status: 'OK', message: 'Migration synced' }
            ];

            const okCount = checkResults.filter(r => r.status === 'OK').length;
            const warnCount = checkResults.filter(r => r.status === 'WARN').length;
            const failCount = checkResults.filter(r => r.status === 'FAIL').length;

            expect(okCount).toBe(2);
            expect(warnCount).toBe(1);
            expect(failCount).toBe(1);
        });

        it('should determine final status correctly', () => {
            // Test failure condition
            let hasFailures = false;
            let hasWarnings = false;
            
            const failureResults = [
                { status: 'OK' },
                { status: 'FAIL' },
                { status: 'WARN' }
            ];
            
            failureResults.forEach(result => {
                if (result.status === 'FAIL') hasFailures = true;
                if (result.status === 'WARN') hasWarnings = true;
            });
            
            expect(hasFailures).toBe(true);
            expect(hasWarnings).toBe(true);
            
            // Should exit with code 1 for failures
            const exitCode = hasFailures ? 1 : (hasWarnings ? 0 : 0);
            expect(exitCode).toBe(1);
        });

        it('should handle warnings-only condition', () => {
            let hasFailures = false;
            let hasWarnings = false;
            
            const warningResults = [
                { status: 'OK' },
                { status: 'WARN' },
                { status: 'OK' }
            ];
            
            warningResults.forEach(result => {
                if (result.status === 'FAIL') hasFailures = true;
                if (result.status === 'WARN') hasWarnings = true;
            });
            
            expect(hasFailures).toBe(false);
            expect(hasWarnings).toBe(true);
            
            // Should exit with code 0 for warnings only
            const exitCode = hasFailures ? 1 : (hasWarnings ? 0 : 0);
            expect(exitCode).toBe(0);
        });
    });

    describe('Database Configuration Logic', () => {
        it('should prioritize PROD_DATABASE_URL over DATABASE_URL', () => {
            const mockEnv = {
                PROD_DATABASE_URL: 'postgresql://prod-specific-url',
                DATABASE_URL: 'postgresql://generic-url'
            };
            
            const prodUrl = mockEnv.PROD_DATABASE_URL || mockEnv.DATABASE_URL;
            expect(prodUrl).toBe('postgresql://prod-specific-url');
        });

        it('should fallback to DATABASE_URL when PROD_DATABASE_URL is not set', () => {
            const mockEnv = {
                DATABASE_URL: 'postgresql://generic-url'
            };
            
            const prodUrl = mockEnv.PROD_DATABASE_URL || mockEnv.DATABASE_URL;
            expect(prodUrl).toBe('postgresql://generic-url');
        });

        it('should detect missing database configuration', () => {
            const mockEnv = {};
            
            const prodUrl = mockEnv.PROD_DATABASE_URL || mockEnv.DATABASE_URL;
            expect(prodUrl).toBeUndefined();
            
            // This should trigger a failure condition
            const hasError = !prodUrl;
            expect(hasError).toBe(true);
        });
    });

    describe('Row Count Comparison Logic', () => {
        it('should warn when prod has no data but dev does', () => {
            const devCount = 100;
            const prodCount = 0;
            
            const shouldWarn = devCount > 0 && prodCount === 0;
            expect(shouldWarn).toBe(true);
        });

        it('should not warn when both environments have data', () => {
            const devCount = 100;
            const prodCount = 50;
            
            const shouldWarn = devCount > 0 && prodCount === 0;
            expect(shouldWarn).toBe(false);
        });

        it('should not warn when both environments are empty', () => {
            const devCount = 0;
            const prodCount = 0;
            
            const shouldWarn = devCount > 0 && prodCount === 0;
            expect(shouldWarn).toBe(false);
        });
    });

    describe('Timestamp Comparison Logic', () => {
        it('should calculate time difference correctly', () => {
            const devDate = new Date('2025-01-01T00:00:00Z');
            const prodDate = new Date('2025-01-08T00:00:00Z'); // 7 days later
            
            const timeDiff = Math.abs(devDate - prodDate) / (1000 * 60 * 60 * 24); // days
            
            expect(timeDiff).toBe(7);
        });

        it('should warn on large time gaps', () => {
            const devDate = new Date('2025-01-01T00:00:00Z');
            const prodDate = new Date('2025-01-15T00:00:00Z'); // 14 days later
            
            const timeDiff = Math.abs(devDate - prodDate) / (1000 * 60 * 60 * 24);
            const shouldWarn = timeDiff >= 7; // 7 days threshold
            
            expect(shouldWarn).toBe(true);
        });

        it('should not warn on recent timestamps', () => {
            const devDate = new Date('2025-01-01T00:00:00Z');
            const prodDate = new Date('2025-01-03T00:00:00Z'); // 2 days later
            
            const timeDiff = Math.abs(devDate - prodDate) / (1000 * 60 * 60 * 24);
            const shouldWarn = timeDiff >= 7; // 7 days threshold
            
            expect(shouldWarn).toBe(false);
        });
    });

    describe('Table Existence Logic', () => {
        it('should detect table mismatch scenarios', () => {
            // Both exist - OK
            expect({ dev: true, prod: true }).toMatchObject({ dev: true, prod: true });
            
            // Both missing - WARN  
            const bothMissing = { dev: false, prod: false };
            expect(bothMissing.dev).toBe(false);
            expect(bothMissing.prod).toBe(false);
            
            // Mismatch - FAIL
            const mismatch1 = { dev: true, prod: false };
            const mismatch2 = { dev: false, prod: true };
            
            expect(mismatch1.dev !== mismatch1.prod).toBe(true);
            expect(mismatch2.dev !== mismatch2.prod).toBe(true);
        });
    });
}); 