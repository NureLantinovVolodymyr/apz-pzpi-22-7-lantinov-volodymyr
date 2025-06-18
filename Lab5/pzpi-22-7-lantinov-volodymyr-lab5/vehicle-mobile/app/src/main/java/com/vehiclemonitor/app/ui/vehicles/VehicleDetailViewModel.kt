package com.vehiclemonitor.app.ui.vehicles

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vehiclemonitor.app.network.NetworkModule
import com.vehiclemonitor.app.network.VehicleData
import com.vehiclemonitor.app.network.CommandRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class VehicleDetailState(
    val vehicleData: List<VehicleData> = emptyList(),
    val recommendations: List<String> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val commandResult: String? = null
)

class VehicleDetailViewModel : ViewModel() {
    private val _detailState = MutableStateFlow(VehicleDetailState())
    val detailState: StateFlow<VehicleDetailState> = _detailState

    fun loadVehicleData(deviceId: String) {
        viewModelScope.launch {
            try {
                _detailState.value = _detailState.value.copy(isLoading = true, error = null)

                val response = NetworkModule.apiService.getVehicleData(deviceId)

                if (response.isSuccessful) {
                    response.body()?.let { data ->
                        _detailState.value = _detailState.value.copy(
                            vehicleData = data,
                            isLoading = false
                        )
                    }
                } else {
                    _detailState.value = _detailState.value.copy(
                        isLoading = false,
                        error = "Failed to load vehicle data: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _detailState.value = _detailState.value.copy(
                    isLoading = false,
                    error = "Network error: ${e.message}"
                )
            }
        }
    }

    fun loadRecommendations(deviceId: String) {
        viewModelScope.launch {
            try {
                val response = NetworkModule.apiService.getRecommendations(deviceId)

                if (response.isSuccessful) {
                    response.body()?.let { recommendationsResponse ->
                        _detailState.value = _detailState.value.copy(
                            recommendations = recommendationsResponse.recommendations
                        )
                    }
                }
            } catch (e: Exception) {
                // Ignore recommendations error, not critical
                println("Failed to load recommendations: ${e.message}")
            }
        }
    }

    fun sendCommand(deviceId: String, command: String) {
        viewModelScope.launch {
            try {
                val response = NetworkModule.apiService.sendCommand(
                    deviceId, CommandRequest(command)
                )

                if (response.isSuccessful) {
                    _detailState.value = _detailState.value.copy(
                        commandResult = "Command sent successfully / Команда надіслана успішно"
                    )
                    // Clear result after showing
                    kotlinx.coroutines.delay(3000)
                    _detailState.value = _detailState.value.copy(commandResult = null)

                    // Reload data after command
                    kotlinx.coroutines.delay(2000)
                    loadVehicleData(deviceId)
                } else {
                    _detailState.value = _detailState.value.copy(
                        error = "Failed to send command: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _detailState.value = _detailState.value.copy(
                    error = "Network error: ${e.message}"
                )
            }
        }
    }
}