'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.checkAngularCli = exports.executeAngularCommand = exports.runAngularExtractI18n = void 0;
const child_process_1 = require('child_process');
/**
 * Execute Angular CLI extract-i18n command
 */
async function runAngularExtractI18n(context, outputPath, format = 'xliff2') {
  const projectName = context.target?.project;
  if (!projectName) {
    return {
      success: false,
      output: '',
      error: 'No project name specified',
    };
  }
  return executeAngularCommand(context, [
    'extract-i18n',
    projectName,
    `--format=${format}`,
    `--output-path=${outputPath}`,
  ]);
}
exports.runAngularExtractI18n = runAngularExtractI18n;
/**
 * Execute generic Angular CLI command
 */
async function executeAngularCommand(context, args) {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    context.logger.info(`Executing: ng ${args.join(' ')}`);
    const ngProcess = (0, child_process_1.spawn)('ng', args, {
      cwd: context.workspaceRoot,
      shell: true,
    });
    ngProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      context.logger.info(text.trim());
    });
    ngProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      context.logger.warn(text.trim());
    });
    ngProcess.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output,
        });
      } else {
        resolve({
          success: false,
          output,
          error: errorOutput || `Process exited with code ${code}`,
        });
      }
    });
    ngProcess.on('error', (err) => {
      resolve({
        success: false,
        output,
        error: err.message,
      });
    });
  });
}
exports.executeAngularCommand = executeAngularCommand;
/**
 * Check if Angular CLI is available
 */
async function checkAngularCli() {
  return new Promise((resolve) => {
    const ngProcess = (0, child_process_1.spawn)('ng', ['version'], { shell: true });
    ngProcess.on('close', (code) => {
      resolve(code === 0);
    });
    ngProcess.on('error', () => {
      resolve(false);
    });
  });
}
exports.checkAngularCli = checkAngularCli;
