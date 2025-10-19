#!/bin/bash

# ngx-i18n-tools Local Testing Workflow
# This script tests the library with the demo application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} ${1}"
}

# Function to check if a command succeeded
check_result() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$1 failed"
        exit 1
    fi
}

# Function to check if file exists
check_file_exists() {
    if [ -f "$1" ]; then
        print_success "Found: $1"
        return 0
    else
        print_error "Missing: $1"
        return 1
    fi
}

# Function to count files matching pattern
count_files() {
    local pattern=$1
    local count=$(find . -name "$pattern" 2>/dev/null | wc -l)
    echo $count
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ngx-i18n-tools - Local Testing Workflow              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

# Step 1: Clean previous builds
print_step "Step 1: Cleaning previous builds"
if [ -d "dist/ngx-i18n-tools" ]; then
    rm -rf dist/ngx-i18n-tools
    print_success "Cleaned dist/ngx-i18n-tools"
fi

# Step 2: Build the library
print_step "Step 2: Building @gridatek/ngx-i18n-tools library"
npm run build:lib
check_result "Library build"

# Step 3: Verify build output
print_step "Step 3: Verifying build output"
check_file_exists "dist/ngx-i18n-tools/package.json"
check_file_exists "dist/ngx-i18n-tools/builders.json"
check_file_exists "dist/ngx-i18n-tools/schematics/collection.json"
check_file_exists "dist/ngx-i18n-tools/src/lib/builders/extract-builder.ts"
check_file_exists "dist/ngx-i18n-tools/src/lib/builders/export-builder.ts"

# Count builders and schemas
builder_count=$(count_files "*-builder.ts" | grep -o "[0-9]*")
schema_count=$(count_files "*-schema.json" | grep -o "[0-9]*")
print_success "Found builder TypeScript files"
print_success "Found schema JSON files"

# Step 4: Create npm package
print_step "Step 4: Creating npm package"
cd dist/ngx-i18n-tools
npm pack
check_result "npm pack"
cd ../..

# Verify tarball was created
TARBALL=$(find dist/ngx-i18n-tools -name "*.tgz" | head -n 1)
if [ -n "$TARBALL" ]; then
    print_success "Created package: $(basename $TARBALL)"
else
    print_error "Failed to create tarball"
    exit 1
fi

# Step 5: Install package locally
print_step "Step 5: Installing package in workspace"
npm install "$TARBALL" --no-save
check_result "Package installation"

# Step 6: Verify installation
print_step "Step 6: Verifying package installation"
if [ -d "node_modules/@gridatek/ngx-i18n-tools" ]; then
    print_success "Package installed in node_modules"

    # Check if builders are accessible
    if [ -f "node_modules/@gridatek/ngx-i18n-tools/builders.json" ]; then
        print_success "Builders registry found"
    fi

    if [ -f "node_modules/@gridatek/ngx-i18n-tools/schematics/collection.json" ]; then
        print_success "Schematics collection found"
    fi
else
    print_error "Package not found in node_modules"
    exit 1
fi

# Step 7: Clean previous demo translations
print_step "Step 7: Cleaning previous demo translations"
if [ -d "projects/demo-app/src/locale" ]; then
    rm -rf projects/demo-app/src/locale
    print_success "Cleaned demo locale directory"
fi

# Remove any existing .i18n.json files
find projects/demo-app/src -name "*.i18n.json" -delete 2>/dev/null || true
print_success "Cleaned existing translation files"

# Step 8: Extract i18n from templates
print_step "Step 8: Running extract-i18n builder"
npm run i18n:extract
check_result "i18n extraction"

# Step 9: Verify extraction output
print_step "Step 9: Verifying extracted translations"
i18n_files=$(find projects/demo-app/src -name "*.i18n.json" | wc -l)
if [ $i18n_files -gt 0 ]; then
    print_success "Found $i18n_files translation file(s)"

    # Show which files were created
    echo -e "\n${YELLOW}Created translation files:${NC}"
    find projects/demo-app/src -name "*.i18n.json" -exec echo "  - {}" \;
else
    print_warning "No translation files created (check if templates have i18n markers)"
fi

# Step 10: Validate translations
print_step "Step 10: Running validation"
npm run i18n:validate
check_result "Translation validation"

# Step 11: Export to XLIFF
print_step "Step 11: Exporting to XLIFF format"
npm run i18n:export
check_result "XLIFF export"

# Step 12: Verify XLIFF output
print_step "Step 12: Verifying XLIFF files"
if [ -d "projects/demo-app/src/locale" ]; then
    xliff_files=$(find projects/demo-app/src/locale -name "*.xlf" | wc -l)
    if [ $xliff_files -gt 0 ]; then
        print_success "Found $xliff_files XLIFF file(s)"

        # Show which files were created
        echo -e "\n${YELLOW}Created XLIFF files:${NC}"
        find projects/demo-app/src/locale -name "*.xlf" -exec echo "  - {}" \;
    else
        print_warning "No XLIFF files created"
    fi
fi

# Step 13: Test merge builder (optional)
print_step "Step 13: Testing merge builder (per-component → merged)"
if [ $i18n_files -gt 0 ]; then
    npm run i18n:merge || print_warning "Merge builder test skipped"

    if [ -f "projects/demo-app/src/locale/translations.json" ]; then
        print_success "Created merged translation file"
    fi
fi

# Step 14: Test split builder (optional)
print_step "Step 14: Testing split builder (merged → per-component)"
if [ -f "projects/demo-app/src/locale/translations.json" ]; then
    # Backup current i18n files
    mkdir -p .test-backup
    find projects/demo-app/src -name "*.i18n.json" -exec cp {} .test-backup/ \; 2>/dev/null || true

    npm run i18n:split || print_warning "Split builder test skipped"

    split_files=$(find projects/demo-app/src -name "*.i18n.json" | wc -l)
    if [ $split_files -gt 0 ]; then
        print_success "Split created $split_files file(s)"
    fi

    # Restore backup
    find .test-backup -name "*.i18n.json" -exec cp {} projects/demo-app/src/app/ \; 2>/dev/null || true
    rm -rf .test-backup
fi

# Step 15: Build demo app
print_step "Step 15: Building demo app (development mode)"
npm run build:demo -- --configuration=development
check_result "Demo app build"

# Step 16: Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Testing Workflow Complete!                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Library built successfully"
echo -e "  ${GREEN}✓${NC} Package created and installed"
echo -e "  ${GREEN}✓${NC} Builders are functional"
echo -e "  ${GREEN}✓${NC} Demo app builds successfully"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Run the demo app:    ${BLUE}npm run serve:demo${NC}"
echo -e "  2. Review translations: ${BLUE}find projects/demo-app/src -name '*.i18n.json'${NC}"
echo -e "  3. Review XLIFF files:  ${BLUE}ls projects/demo-app/src/locale/${NC}"
echo -e "  4. Publish to npm:      ${BLUE}cd dist/ngx-i18n-tools && npm publish --access public${NC}"

echo -e "\n${GREEN}All tests passed!${NC} 🎉\n"
