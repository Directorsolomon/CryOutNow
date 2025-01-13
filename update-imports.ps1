$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx"
foreach ($file in $files) {
    (Get-Content $file.FullName) | 
    ForEach-Object {
        $_ -replace 'from [''"]\.\.?/context/AuthContext[''"]', 'from "@/contexts/AuthContext"' `
           -replace 'from [''"]@/context/AuthContext[''"]', 'from "@/contexts/AuthContext"'
    } | 
    Set-Content $file.FullName
} 