$ErrorActionPreference = "Stop"

# Ensure commands run from repository root (script location).
Set-Location -Path $PSScriptRoot

$timestamp = Get-Date -Format "yyyy/MM/dd HH:mm:ss"
$commitMessage = "$timestamp - Modification de recettes.json"

# Stage only recettes.json.
git add "recettes.json"

# Skip commit/push if there is no staged change for recettes.json.
$stagedForRecettes = git diff --cached --name-only -- "recettes.json"
if (-not $stagedForRecettes) {
    Write-Host "Aucune modification detectee sur recettes.json."
    exit 0
}

git commit -m $commitMessage
git push origin main

Write-Host "Push termine avec le commit : $commitMessage"
