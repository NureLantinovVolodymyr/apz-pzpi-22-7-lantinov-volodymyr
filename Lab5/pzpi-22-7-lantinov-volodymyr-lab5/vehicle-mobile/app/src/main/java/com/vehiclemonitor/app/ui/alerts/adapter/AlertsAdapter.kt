package com.vehiclemonitor.app.ui.alerts.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.vehiclemonitor.app.R
import com.vehiclemonitor.app.databinding.ItemAlertBinding
import com.vehiclemonitor.app.network.Alert
import java.text.SimpleDateFormat
import java.util.*

class AlertsAdapter(
    private val onDismissClick: (Alert) -> Unit
) : ListAdapter<Alert, AlertsAdapter.AlertViewHolder>(AlertDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlertViewHolder {
        val binding = ItemAlertBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return AlertViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AlertViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class AlertViewHolder(
        private val binding: ItemAlertBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(alert: Alert) {
            binding.apply {
                textAlertType.text = when(alert.alertType) {
                    "ENGINE_OVERHEAT" -> "Engine Overheat / Перегрів двигуна"
                    "LOW_FUEL" -> "Low Fuel / Низький рівень палива"
                    "EMERGENCY_MODE" -> "Emergency Mode / Аварійний режим"
                    "MAINTENANCE" -> "Maintenance / Обслуговування"
                    "CONNECTION_LOST" -> "Connection Lost / З'єднання втрачено"
                    else -> alert.alertType
                }

                textAlertMessage.text = alert.message
                textDeviceId.text = "Device: ${alert.deviceId}"

                // Severity
                textSeverity.text = alert.severity
                val severityColor = when(alert.severity) {
                    "CRITICAL" -> R.color.accent_red
                    "HIGH" -> R.color.status_warning
                    "MEDIUM" -> R.color.accent_purple
                    "LOW" -> R.color.status_active
                    else -> R.color.primary_light
                }
                textSeverity.setTextColor(ContextCompat.getColor(itemView.context, severityColor))

                // Timestamp
                try {
                    val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                    val outputFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
                    val date = inputFormat.parse(alert.timestamp)
                    textTimestamp.text = outputFormat.format(date)
                } catch (e: Exception) {
                    textTimestamp.text = alert.timestamp
                }

                // Additional data
                alert.data?.let { data ->
                    val dataInfo = mutableListOf<String>()
                    data.temperature?.let { dataInfo.add("Temp: ${it}°C") }
                    data.fuelLevel?.let { dataInfo.add("Fuel: ${it}%") }
                    data.speed?.let { dataInfo.add("Speed: ${it} km/h") }

                    if (dataInfo.isNotEmpty()) {
                        textAdditionalData.text = dataInfo.joinToString(" • ")
                        textAdditionalData.visibility = android.view.View.VISIBLE
                    } else {
                        textAdditionalData.visibility = android.view.View.GONE
                    }
                } ?: run {
                    textAdditionalData.visibility = android.view.View.GONE
                }

                btnDismiss.setOnClickListener {
                    onDismissClick(alert)
                }
            }
        }
    }
}

class AlertDiffCallback : DiffUtil.ItemCallback<Alert>() {
    override fun areItemsTheSame(oldItem: Alert, newItem: Alert): Boolean {
        return oldItem._id == newItem._id
    }

    override fun areContentsTheSame(oldItem: Alert, newItem: Alert): Boolean {
        return oldItem == newItem
    }
}