Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\user\.gemini\antigravity\brain\1303db92-376e-4341-ba76-64f1bc0e2cbf\veritas_logo_1793553034196.jpg'
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Crop square: X: 212 to 812 (width 600), Y: 70 to 670 (height 600)
$cropRect = New-Object System.Drawing.Rectangle(212, 60, 600, 600)
$cropped = New-Object System.Drawing.Bitmap(600, 600)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$destRect = New-Object System.Drawing.Rectangle(0, 0, 600, 600)
$g.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$dest1 = 'C:\Users\user\OneDrive\Desktop\ai-plagiarism-detector\frontend\public\veritas_logo.jpg'
$dest2 = 'C:\Users\user\OneDrive\Desktop\ai-plagiarism-detector\frontend\public\logo.jpg'
$dest3 = 'C:\Users\user\.gemini\antigravity\brain\1303db92-376e-4341-ba76-64f1bc0e2cbf\veritas_logo_cropped.jpg'

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

$cropped.Save($dest1, $encoder, $encParams)
$cropped.Save($dest2, $encoder, $encParams)
$cropped.Save($dest3, $encoder, $encParams)

$g.Dispose()
$cropped.Dispose()
$src.Dispose()

Write-Host "Logo successfully cropped without text and saved to public folder!"

