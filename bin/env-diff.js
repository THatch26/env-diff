import { Command } from 'commander';
import chalk from 'chalk';
import { parseEnv, diffEnvs } from './diff.js';
import fs from 'fs';

const program = new Command();

program
  .name('env-diff')
  .description('Compare two .env files')
  .version('1.0.0');

program
  .argument('<file1>', 'first .env file')
  .argument('<file2>', 'second .env file')
  .option('--strict', 'exit with error if any differences found')
  .option('--json', 'output as JSON')
  .action((file1, file2, options) => {
    try {
      const env1 = parseEnv(file1);
      const env2 = parseEnv(file2);
      const { missing, extra, changed } = diffEnvs(env1, env2);

      if (options.json) {
        console.log(JSON.stringify({ missing, extra, changed }, null, 2));
        return;
      }

      if (missing.length > 0) {
        console.log(chalk.red(`Missing keys in ${file2}:`));
        missing.forEach(key => console.log(chalk.red(`  - ${key}`)));
      }

      if (extra.length > 0) {
        console.log(chalk.yellow(`Extra keys in ${file2}:`));
        extra.forEach(key => console.log(chalk.yellow(`  - ${key}`)));
      }

      if (changed.length > 0) {
        console.log(chalk.blue(`Changed values:`));
        changed.forEach(c => {
          console.log(chalk.blue(`  - ${c.key}: ${chalk.red(c.oldVal)} -> ${chalk.green(c.newVal)}`));
        });
      }

      if (missing.length > 0 || extra.length > 0 || changed.length > 0) {
        if (options.strict) {
          process.exit(1);
        } else {
          console.log(chalk.bold('\nDifferences found.'));
        }
      } else {
        console.log(chalk.green('No differences found.'));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// For testing purposes
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse(process.argv);
} else {
  export default program;
}
