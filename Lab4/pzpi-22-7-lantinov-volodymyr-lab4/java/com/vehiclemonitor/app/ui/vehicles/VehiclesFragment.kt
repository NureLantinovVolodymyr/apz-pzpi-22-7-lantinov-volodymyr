package com.vehiclemonitor.app.ui.vehicles

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.vehiclemonitor.app.databinding.FragmentVehiclesBinding
import com.vehiclemonitor.app.ui.vehicles.adapter.VehiclesAdapter
import kotlinx.coroutines.launch

class VehiclesFragment : Fragment() {
    private var _binding: FragmentVehiclesBinding? = null
    private val binding get() = _binding!!

    private val viewModel: VehiclesViewModel by viewModels()
    private lateinit var vehiclesAdapter: VehiclesAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentVehiclesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupSwipeRefresh()
        observeViewModel()

        binding.fabAddVehicle.setOnClickListener {
            // TODO: Open add vehicle dialog
        }

        viewModel.loadVehicles()
    }

    private fun setupRecyclerView() {
        vehiclesAdapter = VehiclesAdapter { vehicle ->
            // Открыть экран деталей транспорта
            val intent = Intent(requireContext(), VehicleDetailActivity::class.java)
            intent.putExtra(VehicleDetailActivity.EXTRA_VEHICLE, vehicle)
            startActivity(intent)
        }

        binding.recyclerViewVehicles.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = vehiclesAdapter
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            viewModel.loadVehicles()
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.vehiclesState.collect { state ->
                binding.swipeRefreshLayout.isRefreshing = state.isLoading

                if (state.vehicles.isNotEmpty()) {
                    binding.recyclerViewVehicles.visibility = View.VISIBLE
                    binding.textViewEmpty.visibility = View.GONE
                    vehiclesAdapter.submitList(state.vehicles)
                } else if (!state.isLoading) {
                    binding.recyclerViewVehicles.visibility = View.GONE
                    binding.textViewEmpty.visibility = View.VISIBLE
                }

                state.error?.let { error ->
                    Toast.makeText(context, error, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}