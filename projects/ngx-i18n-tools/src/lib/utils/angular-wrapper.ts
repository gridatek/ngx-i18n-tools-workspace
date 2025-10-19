import { spawn } from 'child_process';
import { BuilderContext } from '@angular-devkit/architect';

export interface AngularCommandResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Execute Angular CLI extract-i18n command
 */
export async function runAngularExtractI18n(
  context: BuilderContext,
  outputPath: string,
  format: 'xliff' | 'xliff2' = 'xliff2',
): Promise<AngularCommandResult> {
  const projectName = context.target?.project;

  if (!projectName) {
    return {
      success: false,
      output: '',
      error: 'No project name specified',
    };
  }

  // Use the Angular Architect API to run extraction with options
  try {
    const extractTarget = { project: projectName, target: 'extract-i18n' };
    const run = await context.scheduleTarget(extractTarget, {
      format,
      outputPath,
    });

    const result = await run.result;
    await run.stop();

    return {
      success: result.success || false,
      output: 'Extraction completed via Architect API',
      error: result.error as string | undefined,
    };
  } catch (error: any) {
    context.logger.error(`Failed to run extraction: ${error.message}`);
    return {
      success: false,
      output: '',
      error: error.message,
    };
  }
}

/**
 * Execute generic Angular CLI command
 */
export async function executeAngularCommand(
  context: BuilderContext,
  args: string[],
): Promise<AngularCommandResult> {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';

    context.logger.info(`Executing: ng ${args.join(' ')}`);

    const ngProcess = spawn('ng', args, {
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

/**
 * Check if Angular CLI is available
 */
export async function checkAngularCli(): Promise<boolean> {
  return new Promise((resolve) => {
    const ngProcess = spawn('ng', ['version'], { shell: true });

    ngProcess.on('close', (code) => {
      resolve(code === 0);
    });

    ngProcess.on('error', () => {
      resolve(false);
    });
  });
}
