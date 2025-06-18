package com.vehiclemonitor.app.network

import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @GET("auth/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("vehicles")
    suspend fun getVehicles(): Response<List<Vehicle>>

    @POST("vehicles/register")
    suspend fun registerVehicle(@Body request: RegisterVehicleRequest): Response<Vehicle>

    @POST("vehicles/add-access")
    suspend fun addAccess(@Body request: AddAccessRequest): Response<ApiResult>

    @GET("vehicles/{deviceId}/data")
    suspend fun getVehicleData(
        @Path("deviceId") deviceId: String,
        @Query("limit") limit: Int = 50,
        @Query("hours") hours: Int = 24
    ): Response<List<VehicleData>>

    @POST("vehicles/{deviceId}/command")
    suspend fun sendCommand(
        @Path("deviceId") deviceId: String,
        @Body request: CommandRequest
    ): Response<ApiResult>

    @GET("vehicles/{deviceId}/recommendations")
    suspend fun getRecommendations(@Path("deviceId") deviceId: String): Response<RecommendationsResponse>

    @GET("alerts")
    suspend fun getAlerts(
        @Query("limit") limit: Int = 50,
        @Query("dismissed") dismissed: String = "false"
    ): Response<List<Alert>>

    @PATCH("alerts/{alertId}/dismiss")
    suspend fun dismissAlert(@Path("alertId") alertId: String): Response<ApiResult>

    @GET("analytics/dashboard")
    suspend fun getDashboard(): Response<DashboardData>
}