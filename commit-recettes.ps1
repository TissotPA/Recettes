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

# Stage only recettes.json.
git add recettes.json

$commitMessage = "$timestamp - Modification de recettes.json"
git commit -m $commitMessage
git push origin gh-pages
Write-Host "Push termine avec le commit : $commitMessage"

git checkout main