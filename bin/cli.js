#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { parseEnv, diffEnvs } from '../src/index.js';

const program = new Command();

program
  .name('env-diff')
  .description('Compare two .env files and show differences')
  .argument('<file1>', 'First .env file path')
  .argument('<file2>', 'Second .env file path')
  .option('--json', 'Output as JSON object')
  .action(async (file1, file2, options) => {
    try {
      const env1 = await parseEnv(file1);
      const env2 = await parseEnv(file2);

      const differences = diffEnvs(env1, env2);

      if (options.json) {
        console.log(JSON.stringify(differences, null, 2));
      } else {
        if (differences.missing.length === 0 && 
            differences.extra.length === 0 && 
            differences.different.length === 0) {
          console.log(chalk.green('✓ Files are identical'));
        } else {
          if (differences.missing.length > 0) {
            console.log(chalk.red('Missing from second file:'));
            differences.missing.forEach(key => console.log(`  - ${key}`));
          }
          if (differences.extra.length > 0) {
            console.log(chalk.yellow('Extra in second file:'));
            differences.extra.forEach(key => console.log(`  + ${key}`));
          }
          if (differences.different.length > 0) {
            console.log(chalk.blue('Different values:'));
            differences.different.forEach(key => console.log(`  ~ ${key}`));
          }
        }
      }

      // Exit code 1 if differences exist, 0 if identical
      process.exit(differences.missing.length === 0 && 
                   differences.extra.length === 0 && 
                   differences.different.length === 0 ? 0 : 1);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();