# =============================================================================
# validate.ps1 — Validation script for prototype files
# Run: npm run validate  (or: powershell -File scripts/validate.ps1)
#
# Checks common mistakes in .ts files:
#   1. Angular 17+ syntax (@if, @for, @switch, @defer) — FORBIDDEN
#   2. Brand name "iiko" — FORBIDDEN
#   3. constructor DI instead of inject() — WARNING
#   4. npm run build
# =============================================================================

param(
    [switch]$All,         # Check ALL .ts files, not just changed ones
    [switch]$SkipBuild    # Skip npm run build
)

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
$totalWarnings = 0

# --- Determine files to check ------------------------------------------------

if ($All) {
    $tsFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" |
               Where-Object { $_.FullName -notmatch 'node_modules' } |
               Select-Object -ExpandProperty FullName
    Write-Host "Mode: ALL .ts files in src/ ($($tsFiles.Count) files)"
} else {
    # Collect changed files from git (unstaged + staged + untracked)
    $diffFiles = @()
    $diffFiles += git diff --name-only 2>$null
    $diffFiles += git diff --cached --name-only 2>$null
    $diffFiles += git ls-files --others --exclude-standard 2>$null
    $diffFiles = $diffFiles | Sort-Object -Unique | Where-Object { $_ -match '\.ts$' -and $_ -match '^src/' }

    if ($diffFiles.Count -eq 0) {
        Write-Host "No changed .ts files found. Use -All to check all files." -ForegroundColor Yellow
        exit 0
    }

    $tsFiles = $diffFiles | ForEach-Object { Join-Path $root $_ }
    Write-Host "Mode: Changed files ($($tsFiles.Count) files)"
}

# --- Check 1: Angular 17+ syntax ---------------------------------------------

Write-HEAD "Check 1: Angular 17+ syntax"

$ng17Patterns = @(
    @{ Pattern = '@if\s*\(';        Label = '@if()' },
    @{ Pattern = '@for\s*\(';       Label = '@for()' },
    @{ Pattern = '@switch\s*\(';    Label = '@switch()' },
    @{ Pattern = '@defer[\s\(\{]';  Label = '@defer' }
)

$found17 = $false
foreach ($file in $tsFiles) {
    if (-not (Test-Path $file)) { continue }
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    foreach ($p in $ng17Patterns) {
        if ($content -match $p.Pattern) {
            $lines = Get-Content $file
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match $p.Pattern) {
                    $relPath = $file -replace [regex]::Escape("$root\"), ''
                    Write-ERR "${relPath}:$($i+1) -- found $($p.Label) (Angular 17+, FORBIDDEN)"
                    $totalErrors++
                    $found17 = $true
                }
            }
        }
    }
}

if (-not $found17) { Write-OK "No Angular 17+ syntax found" }

# --- Check 2: Brand name "iiko" ----------------------------------------------

Write-HEAD "Check 2: Brand name iiko"

$foundIiko = $false
foreach ($file in $tsFiles) {
    if (-not (Test-Path $file)) { continue }
    $relPath = $file -replace [regex]::Escape("$root\"), ''
    if ($relPath -match '(node_modules|\.spec\.ts|environments/)') { continue }

    $lines = Get-Content $file -ErrorAction SilentlyContinue
    if (-not $lines) { continue }

    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'iiko') {
            Write-ERR "${relPath}:$($i+1) -- found 'iiko': $($lines[$i].Trim())"
            $totalErrors++
            $foundIiko = $true
        }
    }
}

if (-not $foundIiko) { Write-OK "No 'iiko' references found" }

# --- Check 3: constructor DI -------------------------------------------------

Write-HEAD "Check 3: constructor DI (should use inject())"

$foundCtor = $false
foreach ($file in $tsFiles) {
    if (-not (Test-Path $file)) { continue }
    $relPath = $file -replace [regex]::Escape("$root\"), ''
    if ($relPath -notmatch 'prototypes[/\\]') { continue }

    $lines = Get-Content $file -ErrorAction SilentlyContinue
    if (-not $lines) { continue }

    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'constructor\s*\(\s*private\s') {
            Write-WARN "${relPath}:$($i+1) -- constructor(private ...) -- use inject() instead"
            $totalWarnings++
            $foundCtor = $true
        }
    }
}

if (-not $foundCtor) { Write-OK "No constructor DI found" }

# --- Check 4: npm run build --------------------------------------------------

if (-not $SkipBuild) {
    Write-HEAD "Check 4: npm run build"

    $buildOutput = & npm run build 2>&1
    $buildExitCode = $LASTEXITCODE

    if ($buildExitCode -eq 0) {
        Write-OK "Build passed"
    } else {
        Write-ERR "Build FAILED (exit code: $buildExitCode)"
        $buildOutput | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        $totalErrors++
    }
} else {
    Write-Host "`n--- Check 4: npm run build -- SKIPPED (-SkipBuild) ---" -ForegroundColor DarkGray
}

# --- Summary ------------------------------------------------------------------

Write-Host "`n============================================" -ForegroundColor Cyan
if ($totalErrors -eq 0 -and $totalWarnings -eq 0) {
    Write-Host "  RESULT: ALL CHECKS PASSED" -ForegroundColor Green
} elseif ($totalErrors -eq 0) {
    Write-Host "  RESULT: PASSED with warnings ($totalWarnings)" -ForegroundColor Yellow
} else {
    Write-Host "  RESULT: ERRORS FOUND" -ForegroundColor Red
    Write-Host "  Errors: $totalErrors | Warnings: $totalWarnings" -ForegroundColor Red
}
Write-Host "============================================`n" -ForegroundColor Cyan

exit $totalErrors
