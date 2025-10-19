import { BuilderContext } from '@angular-devkit/architect';
export interface AngularCommandResult {
  success: boolean;
  output: string;
  error?: string;
}
/**
 * Execute Angular CLI extract-i18n command
 */
export declare function runAngularExtractI18n(
  context: BuilderContext,
  outputPath: string,
  format?: 'xliff' | 'xliff2',
): Promise<AngularCommandResult>;
/**
 * Execute generic Angular CLI command
 */
export declare function executeAngularCommand(
  context: BuilderContext,
  args: string[],
): Promise<AngularCommandResult>;
/**
 * Check if Angular CLI is available
 */
export declare function checkAngularCli(): Promise<boolean>;
