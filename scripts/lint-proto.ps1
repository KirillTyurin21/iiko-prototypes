# =============================================================================
# lint-proto.ps1 — Prototype structure linter
# Run: npm run lint:proto  (or: powershell -File scripts/lint-proto.ps1)
#
# Checks for each prototype slug:
#   1. <slug>.routes.ts exists
#   2. changelog.data.ts exists
#   3. <slug>-prototype.component.ts exists
#   4. Slug registered in prototypes.registry.ts
#   5. Slug has case in changelog-button.component.ts
# =============================================================================

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
if (-not $root) { $root = Get-Location }
Set-Location $root

# Output helpers
function Write-OK    { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-ERR   { param($msg) Write-Host "  [ERR] $msg" -ForegroundColor Red }
function Write-WARN  { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-HEAD  { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

$totalErrors = 0
$prototypesDir = Join-Path $root "src\app\prototypes"

# --- Discover all prototype slugs from folder names --------------------------

$slugs = Get-ChildItem -Path $prototypesDir -Directory |
         Select-Object -ExpandProperty Name |
         Sort-Object

if ($slugs.Count -eq 0) {
    Write-Host "No prototype folders found in src/app/prototypes/" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($slugs.Count) prototypes: $($slugs -join ', ')"

# --- Load reference files for cross-checking ---------------------------------

$registryFile = Join-Path $root "src\app\shared\prototypes.registry.ts"
$changelogBtnFile = Join-Path $root "src\app\components\layout\changelog-button.component.ts"
$appRoutesFile = Join-Path $root "src\app\app.routes.ts"

$registryContent = ''
$changelogBtnContent = ''
$appRoutesContent = ''

if (Test-Path $registryFile)    { $registryContent    = Get-Content $registryFile -Raw }
if (Test-Path $changelogBtnFile){ $changelogBtnContent = Get-Content $changelogBtnFile -Raw }
if (Test-Path $appRoutesFile)   { $appRoutesContent   = Get-Content $appRoutesFile -Raw }

# --- Check each prototype slug -----------------------------------------------

foreach ($slug in $slugs) {
    Write-HEAD "Prototype: $slug"
    $slugDir = Join-Path $prototypesDir $slug

    # Check 1: <slug>.routes.ts
    $routesFile = Join-Path $slugDir "$slug.routes.ts"
    if (Test-Path $routesFile) {
        Write-OK "$slug.routes.ts exists"
    } else {
        Write-ERR "$slug.routes.ts MISSING"
        $totalErrors++
    }

    # Check 2: changelog.data.ts
    $changelogFile = Join-Path $slugDir "changelog.data.ts"
    if (Test-Path $changelogFile) {
        Write-OK "changelog.data.ts exists"
    } else {
        Write-ERR "changelog.data.ts MISSING"
        $totalErrors++
    }

    # Check 3: <slug>-prototype.component.ts
    $protoComponent = Join-Path $slugDir "$slug-prototype.component.ts"
    if (Test-Path $protoComponent) {
        Write-OK "$slug-prototype.component.ts exists"
    } else {
        Write-ERR "$slug-prototype.component.ts MISSING"
        $totalErrors++
    }

    # Check 4: Registered in prototypes.registry.ts
    $registryPattern = "/prototype/$slug"
    if ($registryContent -match [regex]::Escape($registryPattern)) {
        Write-OK "Registered in prototypes.registry.ts"
    } else {
        Write-ERR "NOT registered in prototypes.registry.ts (missing path: $registryPattern)"
        $totalErrors++
    }

    # Check 5: Case in changelog-button.component.ts
    $casePattern = "case\s+['""]$([regex]::Escape($slug))['""]"
    if ($changelogBtnContent -match $casePattern) {
        Write-OK "Case in changelog-button.component.ts"
    } else {
        Write-ERR "NO case in changelog-button.component.ts for '$slug'"
        $totalErrors++
    }
}

# --- Cross-check: registry entries without folders ----------------------------

Write-HEAD "Cross-check: registry vs folders"

$registryMatches = [regex]::Matches($registryContent, "path:\s*['""]\/prototype\/([^'""]+)['""]")
$registrySlugs = $registryMatches | ForEach-Object { $_.Groups[1].Value }

$orphanRegistry = $registrySlugs | Where-Object { $_ -notin $slugs }
if ($orphanRegistry) {
    foreach ($orphan in $orphanRegistry) {
        Write-ERR "Registry has '/prototype/$orphan' but no folder exists"
        $totalErrors++
    }
} else {
    Write-OK "All registry entries have matching folders"
}

# --- Cross-check: app.routes.ts entries without folders -----------------------

Write-HEAD "Cross-check: app.routes.ts vs folders"

$routeMatches = [regex]::Matches($appRoutesContent, "path:\s*['""]prototype\/([^'""]+)['""]")
$routeSlugs = $routeMatches | ForEach-Object { $_.Groups[1].Value }

$orphanRoutes = $routeSlugs | Where-Object { $_ -notin $slugs }
if ($orphanRoutes) {
    foreach ($orphan in $orphanRoutes) {
        Write-ERR "app.routes.ts has 'prototype/$orphan' but no folder exists"
        $totalErrors++
    }
} else {
    Write-OK "All route entries have matching folders"
}

$missingRoutes = $slugs | Where-Object { $_ -notin $routeSlugs }
if ($missingRoutes) {
    foreach ($missing in $missingRoutes) {
        Write-ERR "Folder '$missing' exists but NOT in app.routes.ts"
        $totalErrors++
    }
} else {
    Write-OK "All folders have matching route entries"
}

# --- Summary ------------------------------------------------------------------

Write-Host "`n============================================" -ForegroundColor Cyan
if ($totalErrors -eq 0) {
    Write-Host "  RESULT: ALL CHECKS PASSED ($($slugs.Count) prototypes)" -ForegroundColor Green
} else {
    Write-Host "  RESULT: ERRORS FOUND" -ForegroundColor Red
    Write-Host "  Errors: $totalErrors" -ForegroundColor Red
}
Write-Host "============================================`n" -ForegroundColor Cyan

exit $totalErrors
