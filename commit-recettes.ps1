$ErrorActionPreference = "Stop"

# Ensure commands run from repository root (script location).
Set-Location -Path $PSScriptRoot

$timestamp = Get-Date -Format "yyyy/MM/dd HH:mm:ss"

git checkout main
# Stage all and commit only if there are changes.
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m $timestamp
    git push origin main
    Write-Host "Push termine sur main avec le commit : $timestamp"
} else {
    Write-Host "Aucun changement detecte sur main. Aucun commit/push effectue."
}

git checkout gh-pages

# Sync recettes.json from main into gh-pages working tree.
git checkout main -- recettes.json

# Stage only recettes.json.
git add recettes.json

# Commit/push gh-pages only if recettes.json changed.
git diff --cached --quiet -- recettes.json
if ($LASTEXITCODE -ne 0) {
    $commitMessage = "$timestamp - Modification de recettes.json"
    git commit -m $commitMessage
    git push origin gh-pages
    Write-Host "Push termine sur gh-pages avec le commit : $commitMessage"
} else {
    Write-Host "Aucun changement sur recettes.json pour gh-pages. Aucun commit/push effectue."
}

git checkout main