!include "MUI2.nsh"

Name "SIGEA"
OutFile "SIGEA_Installer.exe"
InstallDir "$PROGRAMFILES\SIGEA"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "PortugueseBR"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "..\dist\*"
  File "..\src\electron.js"
  
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  CreateShortCut "$DESKTOP\SIGEA.lnk" "$INSTDIR\SIGEA.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\uninstall.exe"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\SIGEA.lnk"
SectionEnd

; Desenvolvido por Viktor Casado
