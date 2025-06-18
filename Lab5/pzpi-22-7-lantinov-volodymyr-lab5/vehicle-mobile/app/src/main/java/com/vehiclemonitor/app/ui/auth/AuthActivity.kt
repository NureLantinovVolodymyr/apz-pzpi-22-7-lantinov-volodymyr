package com.vehiclemonitor.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.vehiclemonitor.app.databinding.ActivityAuthBinding
import com.vehiclemonitor.app.ui.main.MainActivity
import kotlinx.coroutines.launch

class AuthActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAuthBinding
    private val viewModel: AuthViewModel by viewModels()
    private var isLoginMode = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupViews()
        observeViewModel()
    }

    private fun setupViews() {
        binding.btnSubmit.setOnClickListener {
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()
            val username = binding.etUsername.text.toString().trim()

            if (isLoginMode) {
                if (email.isNotEmpty() && password.isNotEmpty()) {
                    viewModel.login(email, password)
                }
            } else {
                if (email.isNotEmpty() && password.isNotEmpty() && username.isNotEmpty()) {
                    viewModel.register(username, email, password)
                }
            }
        }

        binding.tvToggleMode.setOnClickListener {
            toggleMode()
        }

        updateUI()
    }

    private fun toggleMode() {
        isLoginMode = !isLoginMode
        updateUI()
    }

    private fun updateUI() {
        if (isLoginMode) {
            binding.btnSubmit.text = getString(com.vehiclemonitor.app.R.string.login)
            binding.tvToggleMode.text = "Don't have account? Register / Немає акаунту? Реєстрація"
            binding.etUsername.visibility = android.view.View.GONE
        } else {
            binding.btnSubmit.text = getString(com.vehiclemonitor.app.R.string.register)
            binding.tvToggleMode.text = "Have account? Login / Є акаунт? Увійти"
            binding.etUsername.visibility = android.view.View.VISIBLE
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            viewModel.authState.collect { state ->
                when (state) {
                    is AuthState.Loading -> {
                        binding.btnSubmit.isEnabled = false
                        binding.btnSubmit.text = getString(com.vehiclemonitor.app.R.string.loading)
                    }
                    is AuthState.Success -> {
                        startActivity(Intent(this@AuthActivity, MainActivity::class.java))
                        finish()
                    }
                    is AuthState.Error -> {
                        binding.btnSubmit.isEnabled = true
                        updateUI()
                        Toast.makeText(this@AuthActivity, state.message, Toast.LENGTH_LONG).show()
                    }
                    is AuthState.Idle -> {
                        binding.btnSubmit.isEnabled = true
                        updateUI()
                    }
                }
            }
        }
    }
}