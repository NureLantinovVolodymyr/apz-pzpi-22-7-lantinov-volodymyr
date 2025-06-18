package com.vehiclemonitor.app.network

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

// Auth
data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val username: String, val email: String, val password: String)
data class AuthResponse(val token: String, val user: User)

@Parcelize
data class User(
    val _id: String?,
    val username: String?,
    val email: String?,
    val role: String?
) : Parcelable

// Vehicles
@Parcelize
data class Vehicle(
    val _id: String,
    val deviceId: String,
    val name: String,
    val model: String?,
    val year: Int?,
    val status: String,
    val lastSeen: String,
    val accessType: String?,
    val ownerInfo: User?
) : Parcelable

data class RegisterVehicleRequest(
    val deviceId: String,
    val name: String,
    val model: String?,
    val year: Int?
)

data class AddAccessRequest(
    val deviceId: String,
    val ownerPassword: String
)

// Vehicle Data
@Parcelize
data class VehicleData(
    val _id: String,
    val deviceId: String,
    val timestamp: String,
    val engineTemp: Float?,
    val fuelLevel: Float?,
    val speed: Float?,
    val engineRunning: Boolean?,
    val emergencyMode: Boolean?
) : Parcelable

data class CommandRequest(val command: String)

// Alerts
@Parcelize
data class Alert(
    val _id: String,
    val deviceId: String,
    val alertType: String,
    val severity: String,
    val message: String,
    val timestamp: String,
    val dismissed: Boolean,
    val data: AlertData?
) : Parcelable

@Parcelize
data class AlertData(
    val temperature: Float?,
    val fuelLevel: Float?,
    val speed: Float?,
    val engineRunning: Boolean?,
    val emergencyMode: Boolean?
) : Parcelable

// Dashboard
data class DashboardData(
    val alerts: List<Alert>,
    val vehicles: List<Vehicle>
)

// Generic
data class ApiResult(val message: String)

// Recommendations
data class RecommendationsResponse(
    val recommendations: List<String>
)

data class ProfileResponse(val user: User)