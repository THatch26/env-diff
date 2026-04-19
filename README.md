# env-diff

A CLI tool that compares two .env files and reports missing keys, extra keys, and changed values.

## Installation

```bash
npm install -g env-diff
```

## Usage

```bash
# Compare two files
env-diff .env .env.example

# Strict mode (exits with code 1 if differences found)
env-diff .env .env.staging --strict

# JSON output for piping
env-diff .env .env.example --json
```

## Help Output

```text
Usage: env-diff <file1> <file2> [options]

Arguments:
  file1                first .env file
  file2                second .env file

Options:
  --strict             exit with error if any differences found
  --json               output as JSON
  -V, --version        output version
  -h, --help           display help
```

## Terminal Output Example

```text
[31mMissing keys in .env.example:[0m
[31m  - API_KEY[0m
[33mExtra keys in .env.example:[0m
[33m  - DEBUG[0m
[34mChanged values:[0m
[34m  - PORT: [31m3000[0m [34m->[0m [32m8080[0m
```

## Use in CI

Add this step to your GitHub Actions workflow to ensure your `.env` files are in sync with your template:

```yaml
- name: Check .env sync
  run: npx env-diff .env .env.example --strict
```
