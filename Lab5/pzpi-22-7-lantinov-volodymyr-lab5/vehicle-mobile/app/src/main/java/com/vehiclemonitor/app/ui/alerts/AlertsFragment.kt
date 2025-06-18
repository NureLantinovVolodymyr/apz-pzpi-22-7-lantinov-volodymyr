package com.vehiclemonitor.app.ui.alerts

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.vehiclemonitor.app.databinding.FragmentAlertsBinding
import com.vehiclemonitor.app.ui.alerts.adapter.AlertsAdapter
import kotlinx.coroutines.launch

class AlertsFragment : Fragment() {
    private var _binding: FragmentAlertsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: AlertsViewModel by viewModels()
    private lateinit var alertsAdapter: AlertsAdapter

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentAlertsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupSwipeRefresh()
        observeViewModel()

        viewModel.loadAlerts()
    }

    private fun setupRecyclerView() {
        alertsAdapter = AlertsAdapter(
            onDismissClick = { alert ->
                viewModel.dismissAlert(alert._id)
            }
        )

        binding.recyclerViewAlerts.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = alertsAdapter
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            viewModel.loadAlerts()
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.alertsState.collect { state ->
                binding.swipeRefreshLayout.isRefreshing = state.isLoading

                if (state.alerts.isNotEmpty()) {
                    binding.recyclerViewAlerts.visibility = View.VISIBLE
                    binding.textViewEmpty.visibility = View.GONE
                    alertsAdapter.submitList(state.alerts)
                } else if (!state.isLoading) {
                    binding.recyclerViewAlerts.visibility = View.GONE
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