Set-Location 'C:\Users\nayth\github\Tool-system'
git rm --cached nul 2>$null
Remove-Item 'nul' -Force -ErrorAction SilentlyContinue
git add -A
git status --short
