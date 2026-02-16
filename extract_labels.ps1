$content = Get-Content chatgpt_content.html -Raw
$pattern = '"label"\s*:\s*"(.*?)"'
$matches = [regex]::Matches($content, $pattern)
foreach ($match in $matches) {
    $match.Groups[1].Value | Out-File labels.txt -Append
}
