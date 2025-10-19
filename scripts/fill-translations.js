#!/usr/bin/env node

/**
 * Script to automatically fill missing translations in demo app
 * Uses simple translations for demonstration purposes
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Translation dictionaries for demo purposes
const translations = {
  // App component translations
  'app.title': {
    en: 'ngx-i18n-tools Demo',
    es: 'Demo de ngx-i18n-tools',
    fr: 'Démo ngx-i18n-tools',
    de: 'ngx-i18n-tools Demo',
  },
  'app.footer': {
    en: '© 2024 Gridatek. All rights reserved.',
    es: '© 2024 Gridatek. Todos los derechos reservados.',
    fr: '© 2024 Gridatek. Tous droits réservés.',
    de: '© 2024 Gridatek. Alle Rechte vorbehalten.',
  },
  'nav.home': {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Startseite',
  },
  'nav.profile': {
    en: 'Profile',
    es: 'Perfil',
    fr: 'Profil',
    de: 'Profil',
  },

  // Profile component translations
  'profile.title': {
    en: 'User Profile',
    es: 'Perfil de Usuario',
    fr: 'Profil Utilisateur',
    de: 'Benutzerprofil',
  },
  'profile.name.label': {
    en: 'Name:',
    es: 'Nombre:',
    fr: 'Nom:',
    de: 'Name:',
  },
  'profile.email.label': {
    en: 'Email:',
    es: 'Correo:',
    fr: 'E-mail:',
    de: 'E-Mail:',
  },
  'profile.edit': {
    en: 'Edit Profile',
    es: 'Editar Perfil',
    fr: 'Modifier le Profil',
    de: 'Profil Bearbeiten',
  },
  'profile.settings': {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    de: 'Einstellungen',
  },
  'profile.search.title': {
    en: 'Search your profile',
    es: 'Buscar en tu perfil',
    fr: 'Rechercher dans votre profil',
    de: 'In Ihrem Profil suchen',
  },
};

async function fillTranslations() {
  console.log('🔍 Finding translation files...\n');

  // Find all .i18n.json files in the demo app
  const pattern = 'projects/demo-app/src/**/*.i18n.json';
  const files = await glob(pattern, { windowsPathsNoEscape: true });

  console.log(`Found ${files.length} translation file(s):\n`);

  let totalUpdated = 0;

  for (const file of files) {
    console.log(`📝 Processing: ${file}`);

    // Read the file
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);

    let updated = false;

    // Fill in missing translations
    for (const [key, locales] of Object.entries(data)) {
      if (translations[key]) {
        // Use predefined translations
        for (const [locale, translation] of Object.entries(translations[key])) {
          if (locales[locale] === '' || !locales[locale]) {
            locales[locale] = translation;
            updated = true;
          }
        }
      } else {
        // For keys not in our dictionary, use a generic approach
        // Copy the English value with a prefix to indicate it needs proper translation
        const enValue = locales.en || '';
        for (const locale of ['es', 'fr', 'de']) {
          if (locales[locale] === '' || !locales[locale]) {
            if (enValue) {
              // Simple placeholder - in real scenario, use a translation service
              locales[locale] = `[${locale.toUpperCase()}] ${enValue}`;
              updated = true;
            }
          }
        }
      }
    }

    if (updated) {
      // Write back to file with pretty formatting
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log(`   ✓ Updated with translations\n`);
      totalUpdated++;
    } else {
      console.log(`   ℹ No missing translations\n`);
    }
  }

  console.log(`\n✨ Complete! Updated ${totalUpdated} file(s)\n`);

  if (totalUpdated > 0) {
    console.log('Next steps:');
    console.log('  1. Run: npm run i18n:export');
    console.log('  2. Run: npm run build:demo\n');
  }
}

// Run the script
fillTranslations().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
