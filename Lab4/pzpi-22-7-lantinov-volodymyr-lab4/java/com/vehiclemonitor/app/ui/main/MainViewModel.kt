package com.vehiclemonitor.app.ui.main

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow

class MainViewModel : ViewModel() {
    private val _logoutEvent = MutableSharedFlow<Boolean>()
    val logoutEvent: SharedFlow<Boolean> = _logoutEvent

    fun logout() {
        _logoutEvent.tryEmit(true)
    }
}