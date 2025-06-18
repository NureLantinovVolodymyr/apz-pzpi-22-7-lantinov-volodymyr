package com.vehiclemonitor.app.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vehiclemonitor.app.network.NetworkModule
import com.vehiclemonitor.app.network.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ProfileState(
    val user: User? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class ProfileViewModel : ViewModel() {
    private val _profileState = MutableStateFlow(ProfileState())
    val profileState: StateFlow<ProfileState> = _profileState

    fun loadProfile() {
        viewModelScope.launch {
            try {
                _profileState.value = _profileState.value.copy(isLoading = true, error = null)

                val response = NetworkModule.apiService.getProfile()

                if (response.isSuccessful) {
                    response.body()?.let { profileResponse ->
                        _profileState.value = _profileState.value.copy(
                            user = profileResponse.user,
                            isLoading = false
                        )
                    }
                } else {
                    _profileState.value = _profileState.value.copy(
                        isLoading = false,
                        error = "Failed to load profile: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _profileState.value = _profileState.value.copy(
                    isLoading = false,
                    error = "Network error: ${e.message}"
                )
            }
        }
    }
}