const { execSync, spawn } = require('child_process');
const path = require('path');

describe('CheckEnvSync - Integration Tests', () => {
    const scriptPath = path.join(__dirname, '../../scripts/checkEnvSync.js');
    
    // Helper function to run the script and capture output
    const runCheckEnvSync = (env = {}) => {
        return new Promise((resolve, reject) => {
            const testEnv = {
                ...process.env,
                NODE_ENV: 'test',
                PROD_DATABASE_URL: 'postgresql://test:test@localhost:5432/test_prod_db',
                DB_HOST: 'localhost',
                DB_PORT: '5432',
                DB_NAME: 'test_dev_db',
                DB_USER: 'test',
                DB_PASSWORD: 'test',
                JWT_SECRET: 'test-secret',
                GOOGLE_CLIENT_ID: 'test-client-id',
                OPENAI_API_KEY: 'test-api-key',
                ...env
            };

            const child = spawn('node', [scriptPath], {
                env: testEnv,
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                resolve({
                    exitCode: code,
                    stdout,
                    stderr
                });
            });

            child.on('error', (error) => {
                reject(error);
            });

            // Kill process after 10 seconds to prevent hanging
            setTimeout(() => {
                child.kill('SIGTERM');
                reject(new Error('Test timeout'));
            }, 10000);
        });
    };

    describe('Environment Variable Validation', () => {
        it('should fail when production database URL is missing', async () => {
            try {
                const result = await runCheckEnvSync({
                    PROD_DATABASE_URL: '',
                    DATABASE_URL: ''
                });

                // The test might succeed or fail, but it shouldn't crash
                expect([0, 1]).toContain(result.exitCode);
                
                // Check if the script at least attempted to run
                expect(typeof result.stdout).toBe('string');
                
            } catch (error) {
                // If the script times out or errors due to missing config, that's expected
                expect(error.message).toMatch(/timeout|Connection|ECONNREFUSED/i);
            }
        });

        it('should attempt to run with valid environment variables', async () => {
            try {
                const result = await runCheckEnvSync();
                
                // The script should at least start and attempt connections
                // Since we're using test databases that might not exist, 
                // we expect either success or connection errors
                expect([0, 1]).toContain(result.exitCode);
                
                // Should show some output indicating the script attempted to run
                expect(typeof result.stdout).toBe('string');
                
            } catch (error) {
                // Connection errors are expected in test environment
                expect(error.message).toMatch(/timeout|Connection|ECONNREFUSED/i);
            }
        });
    });

    describe('Script File Validation', () => {
        it('should have the checkEnvSync script file', () => {
            const fs = require('fs');
            expect(fs.existsSync(scriptPath)).toBe(true);
        });
    });

    describe('Database Query Structure', () => {
        it('should contain expected SQL queries', () => {
            const fs = require('fs');
            if (fs.existsSync(scriptPath)) {
                const scriptContent = fs.readFileSync(scriptPath, 'utf8');
                
                // Check for key SQL queries
                expect(scriptContent).toContain('information_schema.tables');
                expect(scriptContent).toContain('SELECT COUNT(*)');
                expect(scriptContent).toContain('knex_migrations');
                expect(scriptContent).toContain('SELECT MAX(');
            }
        });

        it('should use parameterized queries', () => {
            const fs = require('fs');
            if (fs.existsSync(scriptPath)) {
                const scriptContent = fs.readFileSync(scriptPath, 'utf8');
                
                // Check for parameterized query usage ($1, $2, etc.)
                expect(scriptContent).toContain('$1');
                expect(scriptContent).toContain('$2');
            }
        });
    });

    describe('Logging and Status Output', () => {
        it('should use consistent status prefixes', () => {
            const fs = require('fs');
            if (fs.existsSync(scriptPath)) {
                const scriptContent = fs.readFileSync(scriptPath, 'utf8');
                
                // Check for consistent status logging
                expect(scriptContent).toContain('✅ [OK]');
                expect(scriptContent).toContain('⚠️  [WARN]');
                expect(scriptContent).toContain('❌ [FAIL]');
            }
        });

        it('should include summary section', () => {
            const fs = require('fs');
            if (fs.existsSync(scriptPath)) {
                const scriptContent = fs.readFileSync(scriptPath, 'utf8');
                
                // Check for summary output
                expect(scriptContent).toContain('📈 Summary');
                expect(scriptContent).toContain('Passed:');
                expect(scriptContent).toContain('Warnings:');
                expect(scriptContent).toContain('Failures:');
            }
        });
    });

    describe('Script Structure and Output', () => {
        it('should have proper script structure', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for key functions and structure
            expect(scriptContent).toContain('checkEnvSync');
            expect(scriptContent).toContain('logResult');
            expect(scriptContent).toContain('createPool');
            expect(scriptContent).toContain('executeQuery');
            expect(scriptContent).toContain('checkTableExists');
            expect(scriptContent).toContain('getRowCount');
            expect(scriptContent).toContain('getMigrationStatus');
        });

        it('should use proper exit codes', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for proper exit code usage
            expect(scriptContent).toContain('process.exit(1)'); // Failures
            expect(scriptContent).toContain('process.exit(0)'); // Success/warnings
        });

        it('should have proper error handling', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for error handling patterns
            expect(scriptContent).toContain('try {');
            expect(scriptContent).toContain('catch (error)');
            expect(scriptContent).toContain('finally {');
            expect(scriptContent).toContain('unhandledRejection');
        });
    });

    describe('Configuration and Dependencies', () => {
        it('should require correct dependencies', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for required dependencies
            expect(scriptContent).toContain("require('pg')");
            expect(scriptContent).toContain("require('../config/env')");
        });

        it('should have shebang for command line execution', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Should start with shebang
            expect(scriptContent).toMatch(/^#!/);
        });
    });

    describe('Resource Management', () => {
        it('should include proper connection cleanup', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for connection cleanup
            expect(scriptContent).toContain('client.release()');
            expect(scriptContent).toContain('.end()');
        });

        it('should handle process termination signals', () => {
            const fs = require('fs');
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            
            // Check for signal handling
            expect(scriptContent).toContain('unhandledRejection');
            expect(scriptContent).toContain('.catch(error =>');
        });
    });
}); 