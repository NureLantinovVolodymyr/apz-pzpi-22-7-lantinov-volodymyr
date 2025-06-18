package com.vehiclemonitor.app.ui.vehicles

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vehiclemonitor.app.network.NetworkModule
import com.vehiclemonitor.app.network.Vehicle
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class VehiclesState(
    val vehicles: List<Vehicle> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class VehiclesViewModel : ViewModel() {
    private val _vehiclesState = MutableStateFlow(VehiclesState())
    val vehiclesState: StateFlow<VehiclesState> = _vehiclesState

    fun loadVehicles() {
        viewModelScope.launch {
            try {
                _vehiclesState.value = _vehiclesState.value.copy(isLoading = true, error = null)

                val response = NetworkModule.apiService.getVehicles()

                if (response.isSuccessful) {
                    response.body()?.let { vehicles ->
                        _vehiclesState.value = _vehiclesState.value.copy(
                            vehicles = vehicles,
                            isLoading = false
                        )
                    }
                } else {
                    _vehiclesState.value = _vehiclesState.value.copy(
                        isLoading = false,
                        error = "Failed to load vehicles: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _vehiclesState.value = _vehiclesState.value.copy(
                    isLoading = false,
                    error = "Network error: ${e.message}"
                )
            }
        }
    }

    fun registerNewVehicle(deviceId: String, name: String, model: String?, year: Int?) {
        viewModelScope.launch {
            try {
                _vehiclesState.value = _vehiclesState.value.copy(isLoading = true)

                val response = NetworkModule.apiService.registerVehicle(
                    com.vehiclemonitor.app.network.RegisterVehicleRequest(deviceId, name, model, year)
                )

                if (response.isSuccessful) {
                    loadVehicles() // Reload list
                } else {
                    _vehiclesState.value = _vehiclesState.value.copy(
                        isLoading = false,
                        error = "Failed to register vehicle: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _vehiclesState.value = _vehiclesState.value.copy(
                    isLoading = false,
                    error = "Network error: ${e.message}"
                )
            }
        }
    }

    fun addAccess(deviceId: String, ownerPassword: String) {
        viewModelScope.launch {
            try {
                _vehiclesState.value = _vehiclesState.value.copy(isLoading = true)

                val response = NetworkModule.apiService.addAccess(
                    com.vehiclemonitor.app.network.AddAccessRequest(deviceId, ownerPassword)
                )

                if (response.isSuccessful) {
                    loadVehicles() // Reload list
                } else {
                    _vehiclesState.value = _vehiclesState.value.copy(
                        isLoading = false,
                        error = "Failed to add access: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _vehiclesState.value = _vehiclesState.value.copy(
                    isLoading = false,
                    error = "Network error: ${e.message}"
                )
            }
        }
    }
}