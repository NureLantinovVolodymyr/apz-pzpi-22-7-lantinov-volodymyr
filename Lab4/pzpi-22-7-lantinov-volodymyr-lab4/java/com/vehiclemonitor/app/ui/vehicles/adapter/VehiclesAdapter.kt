package com.vehiclemonitor.app.ui.vehicles.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.vehiclemonitor.app.R
import com.vehiclemonitor.app.databinding.ItemVehicleBinding
import com.vehiclemonitor.app.network.Vehicle
import java.text.SimpleDateFormat
import java.util.*

class VehiclesAdapter(
    private val onVehicleClick: (Vehicle) -> Unit
) : ListAdapter<Vehicle, VehiclesAdapter.VehicleViewHolder>(VehicleDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VehicleViewHolder {
        val binding = ItemVehicleBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VehicleViewHolder(binding)
    }

    override fun onBindViewHolder(holder: VehicleViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class VehicleViewHolder(
        private val binding: ItemVehicleBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(vehicle: Vehicle) {
            binding.apply {
                textVehicleName.text = vehicle.name
                textDeviceId.text = "ID: ${vehicle.deviceId}"
                textVehicleModel.text = "${vehicle.model ?: "Unknown"} ${vehicle.year ?: ""}"

                // Access type
                textAccessType.text = when(vehicle.accessType) {
                    "owner" -> "Owner / Власник"
                    "shared" -> "Shared / Доступ"
                    else -> vehicle.accessType
                }

                // Status
                textStatus.text = when(vehicle.status) {
                    "active" -> "Active / Активний"
                    "inactive" -> "Inactive / Неактивний"
                    "maintenance" -> "Maintenance / Обслуговування"
                    else -> vehicle.status
                }

                // Status color
                val statusColor = when(vehicle.status) {
                    "active" -> R.color.status_active
                    "maintenance" -> R.color.status_warning
                    "inactive" -> R.color.status_critical
                    else -> R.color.primary_light
                }
                textStatus.setTextColor(ContextCompat.getColor(itemView.context, statusColor))

                // Last seen
                try {
                    val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                    val outputFormat = SimpleDateFormat("dd/MM HH:mm", Locale.getDefault())
                    val date = inputFormat.parse(vehicle.lastSeen)
                    textLastSeen.text = "Last seen / Остання активність: ${outputFormat.format(date)}"
                } catch (e: Exception) {
                    textLastSeen.text = "Last seen / Остання активність: ${vehicle.lastSeen}"
                }

                // Owner info
                vehicle.ownerInfo?.let { owner ->
                    textOwnerInfo.text = "Owner / Власник: ${owner.username}"
                    textOwnerInfo.visibility = android.view.View.VISIBLE
                } ?: run {
                    textOwnerInfo.visibility = android.view.View.GONE
                }

                root.setOnClickListener {
                    onVehicleClick(vehicle)
                }
            }
        }
    }
}

class VehicleDiffCallback : DiffUtil.ItemCallback<Vehicle>() {
    override fun areItemsTheSame(oldItem: Vehicle, newItem: Vehicle): Boolean {
        return oldItem._id == newItem._id
    }

    override fun areContentsTheSame(oldItem: Vehicle, newItem: Vehicle): Boolean {
        return oldItem == newItem
    }
}