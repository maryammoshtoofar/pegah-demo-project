# DELETE THIS FILE, use deployToAzureLIVE.ps1 / deployToAzureTEST.ps1 instead

$status = git status --porcelain
if ($status) { throw "There are uncommitted changes." }

az account set -s "<<your pegah-framework subscription Id>>"
az acr login --name pegah-framework
if(-Not $?){ Write-Host '"az acr login" failed' -ForegroundColor DarkRed; exit; }

Get-ChildItem -Path "Framework" -Recurse -Include "package.json","*.csproj" | Resolve-Path -Relative | tar -cf Framework.tar -T -
docker build -f ".\PegahFramework.Server\Dockerfile" . -t pegah-framework-test
if(-Not $?){ Write-Host '"docker build" failed' -ForegroundColor DarkRed; exit; }

docker tag pegah-framework-test pegah-framework.azurecr.io/signum/pegah-framework-test
docker push pegah-framework.azurecr.io/signum/pegah-framework-test
if(-Not $?){ Write-Host '"docker push" failed' -ForegroundColor DarkRed; exit; }


$appName = 'pegah-framework-app-sqlserver'
$resourceGroup = 'pegah-framework-sqlserver'
$url = 'https://pegah-framework-app-sqlserver.azurewebsites.net/'

# $appName = 'pegah-framework-app-postgres'
# $resourceGroup = 'pegah-framework-postgres'
# $url = 'https://pegah-framework-app-postgres.azurewebsites.net/'

Write-Host '# STOP slot' $slotName -ForegroundColor DarkRed
az webapp stop --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe dead $url
Write-Host

Write-Host '# SQL Migrations' -ForegroundColor Cyan
$env:ASPNETCORE_ENVIRONMENT='test'
$p = (Start-Process ".\PegahFramework.Terminal\bin\Debug\net8.0\PegahFramework.Terminal.exe" -ArgumentList "sql" -WorkingDirectory ".\PegahFramework.Terminal\bin\Debug\net8.0\" -NoNewWindow -Wait -PassThru)
if($p.ExitCode -eq -1){ Write-Host '"SQL Migrations" failed' -ForegroundColor DarkRed; exit; }

Write-Host

Write-Host '# START slot' $slotName -ForegroundColor DarkGreen
az webapp start --resource-group $resourceGroup --name $appName
.\Framework\Utils\CheckUrl.exe alive $url
Write-Host
