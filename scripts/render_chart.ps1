param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$snapshotPath = Join-Path $root 'site/js/examples.js'
$snapshot = (& node -e 'require(process.argv[1]); console.log(JSON.stringify(globalThis.MedicalExamples))' $snapshotPath) | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Could not load the token snapshot.' }
$bitmap = [System.Drawing.Bitmap]::new(1100, 470)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$background = [System.Drawing.ColorTranslator]::FromHtml('#f0f4f1')
$ink = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#202c2b'))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#596866'))
$medical = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#087769'))
$general = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#315e9d'))
$heading = [System.Drawing.Font]::new('Segoe UI', 22, [System.Drawing.FontStyle]::Bold)
$label = [System.Drawing.Font]::new('Segoe UI', 12)
$small = [System.Drawing.Font]::new('Consolas', 10)
try {
    $graphics.Clear($background)
    $graphics.DrawString('The domain advantage has a tradeoff.', $heading, $ink, 32, 22)
    $graphics.DrawString('Real token counts / synthetic probes / two 16,000-token vocabularies', $small, $muted, 34, 64)
    $graphics.FillRectangle($medical, 685, 106, 12, 12)
    $graphics.DrawString('Medical BPE', $small, $ink, 705, 103)
    $graphics.FillRectangle($general, 855, 106, 12, 12)
    $graphics.DrawString('General BPE', $small, $ink, 875, 103)
    $maxCount = ($snapshot.examples | ForEach-Object { $_.medical.ids.Count; $_.general.ids.Count } | Measure-Object -Maximum).Maximum
    $scale = 660.0 / $maxCount
    $rowIndex = 0
    foreach ($example in $snapshot.examples) {
        $rowTop = 146 + $rowIndex * 57
        $graphics.DrawString($example.label, $label, $ink, 34, $rowTop + 7)
        $medicalCount = $example.medical.ids.Count
        $generalCount = $example.general.ids.Count
        $graphics.FillRectangle($medical, [float]310, [float]$rowTop, [float]($medicalCount * $scale), [float]17)
        $graphics.FillRectangle($general, [float]310, [float]($rowTop + 22), [float]($generalCount * $scale), [float]17)
        $graphics.DrawString([string]$medicalCount, $small, $ink, [float](320 + $medicalCount * $scale), [float]$rowTop)
        $graphics.DrawString([string]$generalCount, $small, $ink, [float](320 + $generalCount * $scale), [float]($rowTop + 22))
        $rowIndex++
    }
    $graphics.DrawString('Shorter bars = fewer tokens. These examples are not a held-out benchmark.', $small, $muted, 34, 441)
    $assets = Join-Path $root 'site/assets'
    [System.IO.Directory]::CreateDirectory($assets) | Out-Null
    $output = Join-Path $assets 'probe-counts.png'
    $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Rendered $output"
}
finally {
    foreach ($resource in @($graphics, $bitmap, $ink, $muted, $medical, $general, $heading, $label, $small)) { $resource.Dispose() }
}