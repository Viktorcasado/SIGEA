import UIKit
import Flutter

/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * AppDelegate.swift
 */

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    
    // Inicialização de serviços
    BiometricAuth.shared.configure()
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
