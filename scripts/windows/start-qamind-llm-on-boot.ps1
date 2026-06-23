# Optional: run at Windows login via Task Scheduler
# schtasks /Create /TN "QAMind LLM" /TR "C:\Users\Admin\Desktop\start-qamind-llm.bat" /SC ONLOGON /RL HIGHEST /F

$bat = Join-Path $PSScriptRoot "start-qamind-llm.bat"
if (Test-Path $bat) {
  Start-Process -FilePath $bat -WindowStyle Normal
} else {
  Write-Error "Batch file not found: $bat"
}
