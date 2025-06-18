package com.vehiclemonitor.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vehiclemonitor.app.network.NetworkModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object Success : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel : ViewModel() {
    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            try {
                _authState.value = AuthState.Loading

                val response = NetworkModule.apiService.login(
                    com.vehiclemonitor.app.network.LoginRequest(email, password)
                )

                if (response.isSuccessful) {
                    response.body()?.let { authResponse ->
                        NetworkModule.saveToken(authResponse.token)
                        _authState.value = AuthState.Success
                    } ?: run {
                        _authState.value = AuthState.Error("Invalid response")
                    }
                } else {
                    _authState.value = AuthState.Error("Login failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error("Network error: ${e.message}")
            }
        }
    }

    fun register(username: String, email: String, password: String) {
        viewModelScope.launch {
            try {
                _authState.value = AuthState.Loading

                val response = NetworkModule.apiService.register(
                    com.vehiclemonitor.app.network.RegisterRequest(username, email, password)
                )

                if (response.isSuccessful) {
                    response.body()?.let { authResponse ->
                        NetworkModule.saveToken(authResponse.token)
                        _authState.value = AuthState.Success
                    } ?: run {
                        _authState.value = AuthState.Error("Invalid response")
                    }
                } else {
                    _authState.value = AuthState.Error("Registration failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error("Network error: ${e.message}")
            }
        }
    }
}