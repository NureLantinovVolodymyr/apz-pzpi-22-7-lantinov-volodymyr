package com.vehiclemonitor.app

import android.app.Application
import com.vehiclemonitor.app.network.NetworkModule

class VehicleMonitorApp : Application() {
    override fun onCreate() {
        super.onCreate()
        NetworkModule.init(this)
    }
}