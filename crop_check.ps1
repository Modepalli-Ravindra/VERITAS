Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\user\.gemini\antigravity\brain\1303db92-376e-4341-ba76-64f1bc0e2cbf\veritas_logo_1793553034196.jpg')

for ($y = 550; $y -lt 850; $y += 20) {
    $brightCount = 0
    for ($x = 150; $x -lt 874; $x += 10) {
        $pixel = $src.GetPixel($x, $y)
        if ($pixel.R -gt 80 -or $pixel.G -gt 80) { $brightCount++ }
    }
    Write-Host "Y: $y Bright: $brightCount"
}

# Also find bounding box of emblem in Y from 100 to 650
$minX = 1024; $maxX = 0; $minY = 1024; $maxY = 0;
for ($y = 100; $y -lt 650; $y += 5) {
    for ($x = 100; $x -lt 924; $x += 5) {
        $p = $src.GetPixel($x, $y)
        if ($p.R -gt 50 -or $p.G -gt 50) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Emblem bounding box: X: $minX to $maxX, Y: $minY to $maxY"
$src.Dispose()

