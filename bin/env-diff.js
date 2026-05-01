#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { parseEnv, diffEnvs } from '../src/diff.js';

const program = new Command();

program
  .name('env-diff')
  .description('Compare two .env files and report differences')
  .version('1.0.0')
  .argument('<file1>', 'first .env file')
  .argument('<file2>', 'second .env file')
  .option('--strict', 'treat extra keys as errors (exit code 1)')
  .option('--json', 'output diff as JSON')
  .action((file1, file2, options) => {
    try {
      const env1 = parseEnv(file1);
      const env2 = parseEnv(file2);
      const { missing, extra, changed } = diffEnvs(env1, env2);

      const hasDiffs = missing.length > 0 || extra.length > 0 || changed.length > 0;
      const hasErrors = missing.length > 0 || changed.length > 0 ||
        (options.strict && extra.length > 0);

      if (options.json) {
        const result = {
          file1,
          file2,
          missing,
          extra,
          changed,
          has_diffs: hasDiffs,
        };
        console.log(JSON.stringify(result, null, 2));
        if (hasErrors) process.exit(1);
        return;
      }

      if (missing.length > 0) {
        console.log(chalk.red.bold(`\nMissing keys in ${file2}:`));
        missing.forEach((key) => console.log(chalk.red(`  - ${key}`)));
      }

      if (extra.length > 0) {
        const label = options.strict
          ? chalk.red.bold(`\nExtra keys in ${file2}:`)
          : chalk.yellow.bold(`\nExtra keys in ${file2}:`);
        console.log(label);
        extra.forEach((key) => {
          const line = `  - ${key}`;
          if (options.strict) {
            console.log(chalk.red(line));
          } else {
            console.log(chalk.yellow(line));
          }
        });
      }

      if (changed.length > 0) {
        console.log(chalk.blue.bold('\nChanged values:'));
        changed.forEach((c) => {
          console.log(
            chalk.blue(`  - ${c.key}: `) +
              chalk.red(c.oldVal) +
              chalk.blue(' -> ') +
              chalk.green(c.newVal)
          );
        });
      }

      if (!hasDiffs) {
        console.log(chalk.green.bold('\nNo differences found. Files are identical.'));
      } else {
        console.log(chalk.bold(`\n${hasDiffs ? 'Differences found.' : ''}`));
        if (hasErrors) {
          process.exit(1);
        }
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(2);
    }
  });

program.parse(process.argv);
