$files = Get-ChildItem -Path "C:\Users\user\OneDrive\Desktop\ai-plagiarism-detector\frontend\app", "C:\Users\user\OneDrive\Desktop\ai-plagiarism-detector\frontend\components" -Recurse -Filter "*.tsx"
foreach ($f in $files) {
    if ($f.Name -eq "Hero3DCanvas.tsx") { continue }
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $updated = $content `
        -replace '#1F1D2B', '#0B3D3B' `
        -replace '#272435', '#0E4745' `
        -replace '#2E2A3F', '#135451' `
        -replace '#3A354E', '#1A6360' `
        -replace '#FF7A00', '#14B8A6' `
        -replace '#FF8F26', '#2DD4BF' `
        -replace '#FFA94D', '#99F6E4' `
        -replace '#FFE4C7', '#E6FFFB' `
        -replace '#FFF8EF', '#F8FFFE' `
        -replace '#A59FB3', '#8AC7C2'
    if ($updated -ne $content) {
        [System.IO.File]::WriteAllText($f.FullName, $updated)
        Write-Host "Updated: $($f.Name)"
    }
}

