$content = Get-Content chatgpt_content.html -Raw
$pattern = '"text":"(.*?)"'
$matches = [regex]::Matches($content, $pattern)
foreach ($match in $matches) {
    $match.Groups[1].Value | Out-File conversation_text.txt -Append
}
