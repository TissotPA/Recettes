$ErrorActionPreference = "Stop"

# Ensure commands run from repository root (script location).
Set-Location -Path $PSScriptRoot

$timestamp = Get-Date -Format "yyyy/MM/dd HH:mm:ss"

git checkout main
# Stage all
git add .

# Skip commit/push if there is no staged change for recettes.json.
$stagedForRecettes = git diff --cached --name-only -- "recettes.json"
if (-not $stagedForRecettes) {
    Write-Host "Aucune modification detectee sur recettes.json."
    exit 0
}

git commit -m $timestamp
git push origin main

Write-Host "Push termine avec le commit : $timestamp"

git checkout gh-pages

# Sync recettes.json from main into gh-pages working tree.
git checkout main -- recettes.json

# Stage only recettes.json.
git add recettes.json

# Skip gh-pages commit/push when recettes.json is identical.
$stagedForRecettesGhPages = git diff --cached --name-only -- "recettes.json"
if (-not $stagedForRecettesGhPages) {
    Write-Host "Aucun changement sur recettes.json pour gh-pages. Aucun push effectue."
    git checkout main
    exit 0
}

$commitMessage = "$timestamp - Modification de recettes.json"
git commit -m $commitMessage
git push origin gh-pages
Write-Host "Push termine avec le commit : $commitMessage"

git checkout main