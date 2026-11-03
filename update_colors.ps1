$files = Get-ChildItem -Path "C:\Users\user\OneDrive\Desktop\ai-plagiarism-detector\frontend\app", "C:\Users\user\OneDrive\Desktop\ai-plagiarism-detector\frontend\components" -Recurse -Filter "*.tsx"
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $updated = $content `
        -replace '#1A120E', '#1F1D2B' `
        -replace '#241A14', '#272435' `
        -replace '#2D1F17', '#2E2A3F' `
        -replace '#3A2418', '#3A354E' `
        -replace '#A88462', '#FF7A00' `
        -replace '#BD9774', '#FF8F26' `
        -replace '#D5C4AE', '#FFF8EF' `
        -replace '#8F8275', '#A59FB3' `
        -replace '#6B4A2E', '#FFA94D' `
        -replace '#4A4A46', '#4D4666'
    if ($updated -ne $content) {
        [System.IO.File]::WriteAllText($f.FullName, $updated)
        Write-Host "Updated: $($f.Name)"
    }
}
