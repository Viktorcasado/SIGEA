package br.edu.ifal.sigea

import android.content.Context
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import java.util.concurrent.Executor

/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * BiometricAuth.kt - Autenticação Biométrica Nativa Android
 */

class BiometricAuth(private val context: Context) {

    private lateinit var executor: Executor
    private lateinit var biometricPrompt: BiometricPrompt
    private lateinit var promptInfo: BiometricPrompt.PromptInfo

    fun configure() {
        executor = ContextCompat.getMainExecutor(context)
        // Configuração adicional biométrica
    }

    fun authenticate() {
        // Implementação da chamada de autenticação
    }
}
