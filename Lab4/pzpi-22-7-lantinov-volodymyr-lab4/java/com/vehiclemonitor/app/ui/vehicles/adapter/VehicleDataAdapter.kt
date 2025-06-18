package com.vehiclemonitor.app.ui.vehicles.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.vehiclemonitor.app.R
import com.vehiclemonitor.app.databinding.ItemVehicleDataBinding
import com.vehiclemonitor.app.network.VehicleData
import java.text.SimpleDateFormat
import java.util.*

class VehicleDataAdapter : ListAdapter<VehicleData, VehicleDataAdapter.VehicleDataViewHolder>(VehicleDataDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VehicleDataViewHolder {
        val binding = ItemVehicleDataBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VehicleDataViewHolder(binding)
    }

    override fun onBindViewHolder(holder: VehicleDataViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class VehicleDataViewHolder(
        private val binding: ItemVehicleDataBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(data: VehicleData) {
            binding.apply {
                // Timestamp
                try {
                    val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                    val outputFormat = SimpleDateFormat("dd/MM HH:mm:ss", Locale.getDefault())
                    val date = inputFormat.parse(data.timestamp)
                    textTimestamp.text = outputFormat.format(date)
                } catch (e: Exception) {
                    textTimestamp.text = data.timestamp
                }

                // Engine Temperature
                textEngineTemp.text = data.engineTemp?.let {
                    "🌡️ ${it}°C"
                } ?: "🌡️ N/A"

                val tempColor = when {
                    data.engineTemp == null -> R.color.primary_light
                    data.engineTemp > 90 -> R.color.accent_red
                    data.engineTemp > 80 -> R.color.status_warning
                    else -> R.color.status_active
                }
                textEngineTemp.setTextColor(ContextCompat.getColor(itemView.context, tempColor))

                // Fuel Level
                textFuelLevel.text = data.fuelLevel?.let {
                    "⛽ ${it}%"
                } ?: "⛽ N/A"

                val fuelColor = when {
                    data.fuelLevel == null -> R.color.primary_light
                    data.fuelLevel < 20 -> R.color.accent_red
                    data.fuelLevel < 50 -> R.color.status_warning
                    else -> R.color.status_active
                }
                textFuelLevel.setTextColor(ContextCompat.getColor(itemView.context, fuelColor))

                // Speed
                textSpeed.text = data.speed?.let {
                    "🚗 ${it} km/h"
                } ?: "🚗 N/A"

                // Engine Status
                textEngineStatus.text = when (data.engineRunning) {
                    true -> "🔧 Running / Працює"
                    false -> "🔧 Stopped / Зупинено"
                    null -> "🔧 N/A"
                }

                val engineColor = when (data.engineRunning) {
                    true -> R.color.status_active
                    false -> R.color.primary_light
                    null -> R.color.primary_light
                }
                textEngineStatus.setTextColor(ContextCompat.getColor(itemView.context, engineColor))

                // Emergency Mode
                if (data.emergencyMode == true) {
                    textEmergencyMode.visibility = android.view.View.VISIBLE
                    textEmergencyMode.text = "🚨 EMERGENCY MODE / АВАРІЙНИЙ РЕЖИМ"
                    textEmergencyMode.setTextColor(ContextCompat.getColor(itemView.context, R.color.accent_red))
                } else {
                    textEmergencyMode.visibility = android.view.View.GONE
                }
            }
        }
    }
}

class VehicleDataDiffCallback : DiffUtil.ItemCallback<VehicleData>() {
    override fun areItemsTheSame(oldItem: VehicleData, newItem: VehicleData): Boolean {
        return oldItem._id == newItem._id
    }

    override fun areContentsTheSame(oldItem: VehicleData, newItem: VehicleData): Boolean {
        return oldItem == newItem
    }
}