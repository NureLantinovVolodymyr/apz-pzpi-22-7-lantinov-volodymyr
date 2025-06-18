
package com.vehiclemonitor.app.ui.alerts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vehiclemonitor.app.network.Alert
import com.vehiclemonitor.app.network.NetworkModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AlertsState(
    val alerts: List<Alert> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class AlertsViewModel : ViewModel() {
    private val _alertsState = MutableStateFlow(AlertsState())
    val alertsState: StateFlow<AlertsState> = _alertsState

    fun loadAlerts() {
        viewModelScope.launch {
            try {
                _alertsState.value = _alertsState.value.copy(isLoading = true, error = null)

                val response = NetworkModule.apiService.getAlerts()

                if (response.isSuccessful) {
                    response.body()?.let { alerts ->
                        _alertsState.value = _alertsState.value.copy(
                            alerts = alerts,
                            isLoading = false
                        )
                    }
                } else {
                    _alertsState.value = _alertsState.value.copy(
                        isLoading = false,
                        error = "Failed to load alerts: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _alertsState.value = _alertsState.value.copy(
                    isLoading = false,
                    error = "Network error: ${e.message}"
                )
            }
        }
    }

    fun dismissAlert(alertId: String) {
        viewModelScope.launch {
            try {
                val response = NetworkModule.apiService.dismissAlert(alertId)

                if (response.isSuccessful) {
                    // Remove dismissed alert from current list
                    val updatedAlerts = _alertsState.value.alerts.filterNot { it._id == alertId }
                    _alertsState.value = _alertsState.value.copy(alerts = updatedAlerts)
                } else {
                    _alertsState.value = _alertsState.value.copy(
                        error = "Failed to dismiss alert: ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _alertsState.value = _alertsState.value.copy(
                    error = "Network error: ${e.message}"
                )
            }
        }
    }
}