Add-Type -AssemblyName System.Drawing

$srcPath = 'C:\Users\user\.gemini\antigravity\brain\1303db92-376e-4341-ba76-64f1bc0e2cbf\veritas_logo_1793553034196.jpg'
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Optical centering:
# X center is 535. Box width 600 -> X from 235 to 835
# Y: emblem is 100 to 635. Optical center of shield/quill is ~355.
# Box height 600 -> Y from 55 to 655
$cropRect = New-Object System.Drawing.Rectangle(235, 45, 600, 600)
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
$dest4 = 'C:\Users\user\.gemini\antigravity\brain\1303db92-376e-4341-ba76-64f1bc0e2cbf\veritas_logo_1793553034196.jpg'

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

$cropped.Save($dest1, $encoder, $encParams)
$cropped.Save($dest2, $encoder, $encParams)
$cropped.Save($dest3, $encoder, $encParams)
$cropped.Save($dest4, $encoder, $encParams)

$g.Dispose()
$cropped.Dispose()
$src.Dispose()

Write-Host "Logo optically centered and saved!"

