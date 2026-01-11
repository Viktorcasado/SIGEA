package br.edu.ifal.sigea

import android.content.Context
import android.content.SharedPreferences

/*
 * Desenvolvido por Viktor Casado
 * SIGEA – Plataforma Institucional
 * Padrão IFAL / MEC
 *
 * SessionManager.kt - Persistência Segura de Sessão
 */

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("sigea_secure_prefs", Context.MODE_PRIVATE)

    fun saveSession(token: String) {
        prefs.edit().putString("auth_token", token).apply()
    }

    fun getSession(): String? {
        return prefs.getString("auth_token", null)
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
