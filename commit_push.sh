# Caminho do repositório
$repoDir = "C:\Users\Estutante\Desktop\Limpesa--master"

# Mensagem de commit (usa "Atualização automática" se não for informada)
param([string]$msg = "Atualização automática")

# Vai até o diretório do repositório
Set-Location $repoDir

# Verifica se há alterações
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ Nenhuma alteração para comitar."
    exit
}

# Adiciona todas as alterações
git add .

# Faz o commit
git commit -m $msg

# Tenta enviar para master, se falhar tenta main
try {
    git push origin master
} catch {
    git push origin main
}

Write-Host "🚀 Alterações commitadas e enviadas com sucesso!"
