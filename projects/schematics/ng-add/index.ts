import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  return chain([
    addBuilderConfiguration(options),
    createLocaleDirectory(),
    updatePackageJsonScripts(),
    addGitIgnoreEntries(),
    installDependencies(),
  ]);
}

function addBuilderConfiguration(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projectName = options.project || (workspace.extensions['defaultProject'] as string);

    if (!projectName) {
      throw new Error('No project specified and no default project found');
    }

    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new Error(`Project ${projectName} not found`);
    }

    const mode = options.mode || 'per-component';
    const targetLocales = options.targetLocales || ['es', 'fr', 'de'];

    return updateWorkspace((workspace) => {
      const project = workspace.projects.get(projectName);
      if (!project) return;

      // Add extract-i18n builder
      project.targets.add({
        name: 'extract-i18n',
        builder: '@gridatek/ngx-i18n-tools:extract',
        options: {
          mode,
          templatePattern: 'src/**/*.component.html',
          ...(mode === 'per-component'
            ? { translationFileNaming: '{component}.i18n.json' }
            : { outputFile: 'src/locale/translations.json' }),
          outputFormat: 'json',
          sourceLocale: 'en',
          targetLocales,
          preserveExisting: true,
          cleanUnused: false,
          validateInterpolations: true,
        },
      });

      // Add i18n-export builder
      project.targets.add({
        name: 'i18n-export',
        builder: '@gridatek/ngx-i18n-tools:export',
        options: {
          ...(mode === 'merged'
            ? { source: 'src/locale/translations.json' }
            : { translationPattern: 'src/**/*.i18n.{json,xml}' }),
          outputPath: 'src/locale',
          format: 'xliff2',
          sourceLocale: 'en',
          targetLocales,
        },
      });

      // Add i18n-validate builder
      project.targets.add({
        name: 'i18n-validate',
        builder: '@gridatek/ngx-i18n-tools:validate',
        options: {
          ...(mode === 'merged'
            ? { source: 'src/locale/translations.json' }
            : { translationPattern: 'src/**/*.i18n.{json,xml}' }),
          sourceLocale: 'en',
          targetLocales,
        },
      });

      // Configure i18n in project
      if (!project.extensions['i18n']) {
        project.extensions['i18n'] = {
          sourceLocale: 'en',
          locales: {},
        };
      }

      const i18n = project.extensions['i18n'] as any;
      if (!i18n.locales) {
        i18n.locales = {};
      }

      for (const locale of targetLocales) {
        i18n.locales[locale] = `src/locale/messages.${locale}.xlf`;
      }

      context.logger.info('✓ Added ngx-i18n-tools builders to angular.json');
    });
  };
}

function createLocaleDirectory(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const localeDir = 'src/locale';

    if (!tree.exists(localeDir)) {
      tree.create(`${localeDir}/.gitkeep`, '');
      context.logger.info(`✓ Created ${localeDir} directory`);
    }

    return tree;
  };
}

function updatePackageJsonScripts(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const packageJsonPath = 'package.json';

    if (!tree.exists(packageJsonPath)) {
      return tree;
    }

    const packageJsonContent = tree.read(packageJsonPath);
    if (!packageJsonContent) {
      return tree;
    }

    const packageJson = JSON.parse(packageJsonContent.toString());

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add i18n scripts
    const scriptsToAdd = {
      'i18n:extract': 'ng run $npm_package_name:extract-i18n',
      'i18n:export': 'ng run $npm_package_name:i18n-export',
      'i18n:sync': 'npm run i18n:extract && npm run i18n:export',
      'i18n:validate': 'ng run $npm_package_name:i18n-validate',
    };

    let addedScripts = false;

    for (const [script, command] of Object.entries(scriptsToAdd)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        addedScripts = true;
      }
    }

    if (addedScripts) {
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
      context.logger.info('✓ Added i18n scripts to package.json');
    }

    return tree;
  };
}

function addGitIgnoreEntries(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const gitignorePath = '.gitignore';

    if (!tree.exists(gitignorePath)) {
      return tree;
    }

    const gitignoreContent = tree.read(gitignorePath);
    if (!gitignoreContent) {
      return tree;
    }

    let content = gitignoreContent.toString();

    const entriesToAdd = ['# ngx-i18n-tools temp files', '.temp-i18n/'];

    let modified = false;

    for (const entry of entriesToAdd) {
      if (!content.includes(entry)) {
        if (!content.endsWith('\n')) {
          content += '\n';
        }
        content += `${entry}\n`;
        modified = true;
      }
    }

    if (modified) {
      tree.overwrite(gitignorePath, content);
      context.logger.info('✓ Updated .gitignore');
    }

    return tree;
  };
}

function installDependencies(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());

    context.logger.info(`
✓ @gridatek/ngx-i18n-tools installed successfully!

Next steps:
1. Add i18n markers to your templates:
   <h1 i18n="@@welcome">Welcome</h1>

2. Extract translations:
   npm run i18n:extract

3. Fill in translations in generated files

4. Export to XLIFF:
   npm run i18n:export

5. Build with localization:
   ng build --localize

Documentation: https://github.com/gridatek/ngx-i18n-tools
    `);

    return tree;
  };
}
