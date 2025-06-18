package com.vehiclemonitor.app.ui.profile

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.vehiclemonitor.app.databinding.FragmentProfileBinding
import com.vehiclemonitor.app.network.NetworkModule
import com.vehiclemonitor.app.ui.auth.AuthActivity
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProfileViewModel by viewModels()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupViews()
        observeViewModel()
        viewModel.loadProfile()
    }

    private fun setupViews() {
        binding.btnLogout.setOnClickListener {
            logout()
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.profileState.collect { state ->
                binding.progressBar.visibility = if (state.isLoading) View.VISIBLE else View.GONE

                state.user?.let { user ->
                    // Убедимся что данные не пустые перед отображением
                    binding.textUsername.text = user.username ?: "Unknown User"
                    binding.textEmail.text = user.email ?: "No email"
                    binding.textRole.text = when(user.role) {
                        "admin" -> "Administrator / Адміністратор"
                        "user" -> "User / Користувач"
                        else -> user.role ?: "Unknown Role"
                    }

                    // Скрыть прогресс бар когда данные загружены
                    binding.progressBar.visibility = View.GONE
                }

                state.error?.let { error ->
                    Toast.makeText(context, error, Toast.LENGTH_LONG).show()
                    // Скрыть прогресс бар при ошибке
                    binding.progressBar.visibility = View.GONE
                }
            }
        }
    }

    private fun logout() {
        NetworkModule.clearToken()
        startActivity(Intent(requireContext(), AuthActivity::class.java))
        requireActivity().finish()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}