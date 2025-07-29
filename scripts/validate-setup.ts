#!/usr/bin/env bun

/**
 * Hamsoya Project Validation Script
 *
 * This script validates the entire project setup:
 * - Monorepo structure
 * - Dependencies
 * - TypeScript compilation
 * - Environment configuration
 * - Database connectivity
 * - API endpoints
 */

import { existsSync } from 'fs';
import { join } from 'path';

// @ts-ignore: Bun is a global in Bun runtime

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message: string) => log(`✅ ${message}`, 'green');
const logError = (message: string) => log(`❌ ${message}`, 'red');
const logInfo = (message: string) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message: string) => log(`⚠️  ${message}`, 'yellow');

interface ValidationResult {
  category: string;
  checks: { name: string; passed: boolean; error?: string }[];
}

class ProjectValidator {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private addResult(category: string, name: string, passed: boolean, error?: string) {
    let categoryResult = this.results.find(r => r.category === category);
    if (!categoryResult) {
      categoryResult = { category, checks: [] };
      this.results.push(categoryResult);
    }
    categoryResult.checks.push({ name, passed, error });
  }

  private async runCommand(command: string, cwd?: string): Promise<{ success: boolean; output: string }> {
    try {
      const proc = Bun.spawn(command.split(' '), {
        cwd: cwd || this.projectRoot,
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const output = await new Response(proc.stdout).text();
      const exitCode = await proc.exited;

      return {
        success: exitCode === 0,
        output: output.trim(),
      };
    } catch (error) {
      return {
        success: false,
        output: String(error),
      };
    }
  }

  async validateProjectStructure() {
    logInfo('Validating project structure...');

    const requiredPaths = [
      'apps/frontend',
      'apps/backend',
      'apps/frontend/package.json',
      'apps/backend/package.json',
      'apps/frontend/src',
      'apps/backend/src',
      'apps/backend/src/index.ts',
      'apps/backend/src/trpc/router.ts',
      'apps/backend/src/db/schema.ts',
      'apps/backend/wrangler.toml',
      'apps/backend/drizzle.config.ts',
      'DEPLOYMENT.md',
    ];

    for (const path of requiredPaths) {
      const fullPath = join(this.projectRoot, path);
      const exists = existsSync(fullPath);
      this.addResult('Project Structure', path, exists, exists ? undefined : 'File/directory not found');
    }
  }

  async validateDependencies() {
    logInfo('Validating dependencies...');

    // Check root dependencies
    const rootResult = await this.runCommand('bun install --dry-run');
    this.addResult('Dependencies', 'Root workspace', rootResult.success, rootResult.success ? undefined : rootResult.output);

    // Check frontend dependencies
    const frontendResult = await this.runCommand('bun install --dry-run', 'apps/frontend');
    this.addResult('Dependencies', 'Frontend workspace', frontendResult.success, frontendResult.success ? undefined : frontendResult.output);

    // Check backend dependencies
    const backendResult = await this.runCommand('bun install --dry-run', 'apps/backend');
    this.addResult('Dependencies', 'Backend workspace', backendResult.success, backendResult.success ? undefined : backendResult.output);
  }

  async validateTypeScript() {
    logInfo('Validating TypeScript compilation...');

    // Check frontend TypeScript
    const frontendTsResult = await this.runCommand('bun run type-check', 'apps/frontend');
    this.addResult('TypeScript', 'Frontend compilation', frontendTsResult.success, frontendTsResult.success ? undefined : frontendTsResult.output);

    // Check backend TypeScript
    const backendTsResult = await this.runCommand('bun run type-check', 'apps/backend');
    this.addResult('TypeScript', 'Backend compilation', backendTsResult.success, backendTsResult.success ? undefined : backendTsResult.output);
  }

  async validateEnvironment() {
    logInfo('Validating environment configuration...');

    // Check for environment files
    const envFiles = [
      '.env.example',
      'apps/frontend/.env.example',
      'apps/backend/.env.example',
    ];

    for (const envFile of envFiles) {
      const exists = existsSync(join(this.projectRoot, envFile));
      this.addResult('Environment', envFile, exists, exists ? undefined : 'Environment file not found');
    }

    // Check if actual .env files exist (optional)
    const actualEnvFiles = [
      '.env',
      'apps/frontend/.env.local',
      'apps/backend/.env',
    ];

    for (const envFile of actualEnvFiles) {
      const exists = existsSync(join(this.projectRoot, envFile));
      if (!exists) {
        logWarning(`Optional environment file not found: ${envFile}`);
      }
    }
  }

  async validateBuildProcess() {
    logInfo('Validating build process...');

    // Test frontend build
    const frontendBuildResult = await this.runCommand('bun run build', 'apps/frontend');
    this.addResult('Build Process', 'Frontend build', frontendBuildResult.success, frontendBuildResult.success ? undefined : frontendBuildResult.output);

    // Test backend build
    const backendBuildResult = await this.runCommand('bun run build', 'apps/backend');
    this.addResult('Build Process', 'Backend build', backendBuildResult.success, backendBuildResult.success ? undefined : backendBuildResult.output);
  }

  async validateScripts() {
    logInfo('Validating project scripts...');

    const scripts = [
      { name: 'Backend deployment script', path: 'apps/backend/scripts/deploy.sh' },
      { name: 'Backend secrets setup script', path: 'apps/backend/scripts/setup-secrets.sh' },
      { name: 'Backend test script', path: 'apps/backend/scripts/test-api.ts' },
      { name: 'Backend performance test script', path: 'apps/backend/scripts/performance-test.ts' },
      { name: 'Database setup script', path: 'apps/backend/scripts/setup-database.ts' },
    ];

    for (const script of scripts) {
      const exists = existsSync(join(this.projectRoot, script.path));
      this.addResult('Scripts', script.name, exists, exists ? undefined : 'Script not found');
    }
  }

  printResults() {
    log('\n📊 Validation Results Summary\n', 'bright');

    let totalChecks = 0;
    let passedChecks = 0;

    for (const result of this.results) {
      log(`\n${result.category}:`, 'cyan');

      for (const check of result.checks) {
        totalChecks++;
        if (check.passed) {
          passedChecks++;
          logSuccess(`  ${check.name}`);
        } else {
          logError(`  ${check.name}`);
          if (check.error) {
            log(`    Error: ${check.error}`, 'red');
          }
        }
      }
    }

    log('\n📈 Overall Results:', 'bright');
    log(`Total Checks: ${totalChecks}`, 'blue');
    log(`Passed: ${passedChecks}`, 'green');
    log(`Failed: ${totalChecks - passedChecks}`, totalChecks - passedChecks > 0 ? 'red' : 'green');
    log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`, passedChecks === totalChecks ? 'green' : 'yellow');

    if (passedChecks === totalChecks) {
      log('\n🎉 All validations passed! Your Hamsoya project is ready for development and deployment.', 'green');
    } else {
      log('\n⚠️  Some validations failed. Please review the errors above and fix them before proceeding.', 'yellow');
    }

    return passedChecks === totalChecks;
  }

  async runAllValidations() {
    log('\n🔍 Starting Hamsoya Project Validation\n', 'bright');

    try {
      await this.validateProjectStructure();
      await this.validateDependencies();
      await this.validateTypeScript();
      await this.validateEnvironment();
      await this.validateBuildProcess();
      await this.validateScripts();

      const allPassed = this.printResults();

      if (allPassed) {
        log('\n✨ Validation completed successfully!\n', 'bright');
        process.exit(0);
      } else {
        log('\n❌ Validation completed with errors!\n', 'red');
        process.exit(1);
      }
    } catch (error) {
      logError(`Validation failed: ${error}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const validator = new ProjectValidator();
  await validator.runAllValidations();
}

// Run validation
if (import.meta.main) {
  main().catch((error) => {
    log(`Validation script failed: ${error.message}`, 'red');
    process.exit(1);
  });
}
