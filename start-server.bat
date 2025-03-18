@echo off
echo Starting simple HTTP server for Basketball Central website
echo.
echo Opening http://localhost:8000 in your default browser...
echo.
echo Press Ctrl+C to stop the server when you're done
echo.
start http://localhost:8000
powershell -Command "& {$Hnd = New-Object System.Net.HttpListener; $Hnd.Prefixes.Add('http://localhost:8000/'); $Hnd.Start(); Write-Host 'Listening on http://localhost:8000/'; while ($Hnd.IsListening) {$HC = $Hnd.GetContext(); $HRQ = $HC.Request; $HRS = $HC.Response; $HRS.Headers.Add('Content-Type','text/html'); $P = $HRQ.RawUrl; $FI = 'index.html'; if ($P -ne '/') {$FI = $P.Substring(1)}; if(!(Test-Path $FI)) {$FI = 'index.html'}; $BF = [System.IO.File]::ReadAllBytes($FI); $HRS.ContentLength64 = $BF.Length; $HRS.OutputStream.Write($BF, 0, $BF.Length); $HRS.Close()}; $Hnd.Stop()}"
