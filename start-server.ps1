# PowerShell script to start a simple HTTP server
# This uses PowerShell's built-in capabilities to serve files without requiring Python or Node.js

# Get the current directory
$dir = $PSScriptRoot

# Create a listener on port 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()

Write-Host "Server started at http://localhost:8000/"
Write-Host "Press Ctrl+C to stop the server"

# Define MIME types for common web files
$mimeTypes = @{
    ".html" = "text/html"
    ".css" = "text/css"
    ".js" = "application/javascript"
    ".json" = "application/json"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif" = "image/gif"
    ".svg" = "image/svg+xml"
    ".ico" = "image/x-icon"
    ".ttf" = "font/ttf"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
}

try {
    while ($listener.IsListening) {
        # Get request context
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Get requested file path
        $requestedFile = [System.Web.HttpUtility]::UrlDecode($request.Url.LocalPath)
        if ($requestedFile -eq "/") {
            $requestedFile = "/index.html"
        }
        $filePath = Join-Path $dir $requestedFile.TrimStart("/")

        # Check if file exists
        if (Test-Path $filePath -PathType Leaf) {
            # Get file extension
            $extension = [System.IO.Path]::GetExtension($filePath)
            
            # Set content type
            if ($mimeTypes.ContainsKey($extension)) {
                $response.ContentType = $mimeTypes[$extension]
            } else {
                $response.ContentType = "application/octet-stream"
            }

            # Read file content
            $fileContent = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $fileContent.Length
            $response.OutputStream.Write($fileContent, 0, $fileContent.Length)
        } else {
            # File not found
            $response.StatusCode = 404
            $notFoundMessage = "404 - File not found: $requestedFile"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFoundMessage)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }

        # Close response
        $response.Close()
    }
} finally {
    # Stop listener
    $listener.Stop()
}
