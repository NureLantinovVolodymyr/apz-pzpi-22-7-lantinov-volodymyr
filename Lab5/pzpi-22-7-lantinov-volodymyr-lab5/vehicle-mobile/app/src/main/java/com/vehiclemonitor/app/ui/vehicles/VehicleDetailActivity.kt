package com.vehiclemonitor.app.ui.vehicles

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.button.MaterialButton
import com.vehiclemonitor.app.R
import com.vehiclemonitor.app.network.Vehicle
import com.vehiclemonitor.app.network.VehicleData
import com.vehiclemonitor.app.ui.vehicles.adapter.VehicleDataAdapter
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class VehicleDetailActivity : AppCompatActivity() {
    private val viewModel: VehicleDetailViewModel by viewModels()
    private lateinit var dataAdapter: VehicleDataAdapter

    // Views
    private lateinit var toolbar: Toolbar
    private lateinit var textVehicleName: TextView
    private lateinit var textDeviceId: TextView
    private lateinit var textVehicleModel: TextView
    private lateinit var textVehicleStatus: TextView
    private lateinit var textAccessType: TextView
    private lateinit var textEngineTemp: TextView
    private lateinit var textFuelLevel: TextView
    private lateinit var textSpeed: TextView
    private lateinit var textEngineStatus: TextView
    private lateinit var btnStartEngine: MaterialButton
    private lateinit var btnStopEngine: MaterialButton
    private lateinit var btnEmergencyMode: MaterialButton
    private lateinit var btnCopyDeviceId: MaterialButton
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var recyclerViewData: RecyclerView
    private lateinit var textNoData: TextView
    private lateinit var textOnlineStatus: TextView

    companion object {
        const val EXTRA_VEHICLE = "extra_vehicle"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_vehicle_detail)

        initViews()
        setupToolbar()

        val vehicle = intent.getParcelableExtra<Vehicle>(EXTRA_VEHICLE)
        if (vehicle == null) {
            finish()
            return
        }

        setupViews(vehicle)
        setupRecyclerView()
        observeViewModel()

        viewModel.loadVehicleData(vehicle.deviceId)
        viewModel.loadRecommendations(vehicle.deviceId)
    }

    private fun initViews() {
        toolbar = findViewById(R.id.toolbar)
        textVehicleName = findViewById(R.id.textVehicleName)
        textDeviceId = findViewById(R.id.textDeviceId)
        textVehicleModel = findViewById(R.id.textVehicleModel)
        textVehicleStatus = findViewById(R.id.textVehicleStatus)
        textAccessType = findViewById(R.id.textAccessType)
        textEngineTemp = findViewById(R.id.textEngineTemp)
        textFuelLevel = findViewById(R.id.textFuelLevel)
        textSpeed = findViewById(R.id.textSpeed)
        textEngineStatus = findViewById(R.id.textEngineStatus)
        btnStartEngine = findViewById(R.id.btnStartEngine)
        btnStopEngine = findViewById(R.id.btnStopEngine)
        btnEmergencyMode = findViewById(R.id.btnEmergencyMode)
        btnCopyDeviceId = findViewById(R.id.btnCopyDeviceId)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        recyclerViewData = findViewById(R.id.recyclerViewData)
        textNoData = findViewById(R.id.textNoData)
        textOnlineStatus = findViewById(R.id.textOnlineStatus)
    }

    private fun setupToolbar() {
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setHomeAsUpIndicator(android.R.drawable.ic_menu_close_clear_cancel)
    }

    private fun setupViews(vehicle: Vehicle) {
        supportActionBar?.title = vehicle.name

        textVehicleName.text = vehicle.name
        textDeviceId.text = vehicle.deviceId
        textVehicleModel.text = "${vehicle.model ?: "Unknown"} ${vehicle.year ?: ""}"
        textVehicleStatus.text = when(vehicle.status) {
            "active" -> "Active / Активний"
            "inactive" -> "Inactive / Неактивний"
            "maintenance" -> "Maintenance / Обслуговування"
            else -> vehicle.status
        }

        textAccessType.text = when(vehicle.accessType) {
            "owner" -> "Owner / Власник"
            "shared" -> "Shared Access / Спільний доступ"
            else -> vehicle.accessType ?: "Unknown"
        }

        // Copy Device ID button
        btnCopyDeviceId.setOnClickListener {
            copyToClipboard(vehicle.deviceId, "Device ID copied!")
        }

        // Command buttons
        btnStartEngine.setOnClickListener {
            viewModel.sendCommand(vehicle.deviceId, "START_ENGINE")
        }

        btnStopEngine.setOnClickListener {
            viewModel.sendCommand(vehicle.deviceId, "STOP_ENGINE")
        }

        btnEmergencyMode.setOnClickListener {
            viewModel.sendCommand(vehicle.deviceId, "EMERGENCY_MODE")
        }

        swipeRefreshLayout.setOnRefreshListener {
            viewModel.loadVehicleData(vehicle.deviceId)
            viewModel.loadRecommendations(vehicle.deviceId)
        }
    }

    private fun copyToClipboard(text: String, message: String) {
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Device ID", text)
        clipboard.setPrimaryClip(clip)
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    private fun setupRecyclerView() {
        dataAdapter = VehicleDataAdapter()
        recyclerViewData.apply {
            layoutManager = LinearLayoutManager(this@VehicleDetailActivity)
            adapter = dataAdapter
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.detailState.collect { state ->
                swipeRefreshLayout.isRefreshing = state.isLoading

                if (state.vehicleData.isNotEmpty()) {
                    recyclerViewData.visibility = android.view.View.VISIBLE
                    textNoData.visibility = android.view.View.GONE
                    dataAdapter.submitList(state.vehicleData)

                    // Show latest data in header
                    state.vehicleData.firstOrNull()?.let { latestData ->
                        updateLatestDataUI(latestData)
                        updateOnlineStatus(latestData)
                    }
                } else if (!state.isLoading) {
                    recyclerViewData.visibility = android.view.View.GONE
                    textNoData.visibility = android.view.View.VISIBLE
                }

                state.error?.let { error ->
                    Toast.makeText(this@VehicleDetailActivity, error, Toast.LENGTH_LONG).show()
                }

                state.commandResult?.let { result ->
                    Toast.makeText(this@VehicleDetailActivity, result, Toast.LENGTH_SHORT).show()
                }

                // Update button states
                state.vehicleData.firstOrNull()?.let { latestData ->
                    updateButtonStates(latestData)
                }
            }
        }
    }

    private fun updateLatestDataUI(data: VehicleData) {
        textEngineTemp.text = "🌡️ ${data.engineTemp?.let { "$it°C" } ?: "N/A"}"

        // Color temperature
        data.engineTemp?.let { temp ->
            val color = when {
                temp > 100 -> R.color.accent_red
                temp > 80 -> R.color.status_warning
                else -> R.color.status_active
            }
            textEngineTemp.setTextColor(ContextCompat.getColor(this, color))
        }

        textFuelLevel.text = "⛽ ${data.fuelLevel?.let { "$it%" } ?: "N/A"}"

        // Color fuel level
        data.fuelLevel?.let { fuel ->
            val color = when {
                fuel < 10 -> R.color.accent_red
                fuel < 30 -> R.color.status_warning
                else -> R.color.status_active
            }
            textFuelLevel.setTextColor(ContextCompat.getColor(this, color))
        }

        textSpeed.text = "🚗 ${data.speed?.let { "$it km/h" } ?: "N/A"}"
        textEngineStatus.text = "🔧 ${if (data.engineRunning == true) "Running / Працює" else "Stopped / Зупинено"}"

        // Color engine status
        val engineColor = if (data.engineRunning == true) R.color.status_active else R.color.primary_light
        textEngineStatus.setTextColor(ContextCompat.getColor(this, engineColor))
    }

    private fun updateOnlineStatus(data: VehicleData) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val timestamp = inputFormat.parse(data.timestamp)
            val currentTime = Date()
            val diffMinutes = (currentTime.time - (timestamp?.time ?: 0)) / (1000 * 60)

            if (diffMinutes < 5) {
                textOnlineStatus.text = "🟢 Online / В мережі"
                textOnlineStatus.setTextColor(ContextCompat.getColor(this, R.color.status_active))
            } else {
                textOnlineStatus.text = "🔴 Offline / Не в мережі"
                textOnlineStatus.setTextColor(ContextCompat.getColor(this, R.color.accent_red))
            }
        } catch (e: Exception) {
            textOnlineStatus.text = "❓ Unknown / Невідомо"
            textOnlineStatus.setTextColor(ContextCompat.getColor(this, R.color.primary_light))
        }
    }

    private fun updateButtonStates(data: VehicleData) {
        val isEngineRunning = data.engineRunning == true
        val isEmergencyMode = data.emergencyMode == true

        // Start Engine button
        btnStartEngine.isEnabled = !isEngineRunning
        btnStartEngine.backgroundTintList = if (isEngineRunning) {
            ContextCompat.getColorStateList(this, R.color.primary_light)
        } else {
            ContextCompat.getColorStateList(this, R.color.accent_green)
        }

        // Stop Engine button
        btnStopEngine.isEnabled = isEngineRunning
        btnStopEngine.backgroundTintList = if (!isEngineRunning) {
            ContextCompat.getColorStateList(this, R.color.primary_light)
        } else {
            ContextCompat.getColorStateList(this, R.color.accent_red)
        }

        // Emergency Mode button
        btnEmergencyMode.text = if (isEmergencyMode) {
            "🚨 Emergency ON / Аварійний УВІМК"
        } else {
            "🛡️ Emergency Mode / Аварійний режим"
        }

        btnEmergencyMode.backgroundTintList = if (isEmergencyMode) {
            ContextCompat.getColorStateList(this, R.color.accent_red)
        } else {
            ContextCompat.getColorStateList(this, R.color.accent_purple)
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                finish()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}