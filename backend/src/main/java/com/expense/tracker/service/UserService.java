package com.expense.tracker.service;

import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.SignupRequest;
import com.expense.tracker.entity.User;
import com.expense.tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public String initSignup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail()).get();
            if (existing.isVerified()) {
                throw new RuntimeException("Email already registered!");
            } else {
                existing.setName(request.getName());
                existing.setPassword(encoder.encode(request.getPassword()));
                userRepository.save(existing);
                otpService.generateAndSendOtp(request.getEmail());
                return "OTP sent to email. Please verify to complete signup.";
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setVerified(false);
        userRepository.save(user);
        otpService.generateAndSendOtp(request.getEmail());
        return "OTP sent to email. Please verify to complete signup.";
    }

    public String verifySignup(String email, String otp) {
        if (otpService.verifyOtp(email, otp)) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setVerified(true);
            userRepository.save(user);
            return "Signup successful! You can now login.";
        } else {
            throw new RuntimeException("Invalid or expired OTP");
        }
    }

    public String initLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not registered"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (!user.isVerified()) {
             throw new RuntimeException("Account not verified. Please complete signup.");
        }

        otpService.generateAndSendOtp(request.getEmail());
        return "Credentials valid. OTP sent to email.";
    }

    public String verifyLogin(String email, String otp) {
        if (otpService.verifyOtp(email, otp)) {
            return "Login successful!";
        } else {
            throw new RuntimeException("Invalid or expired OTP");
        }
    }
    
    public User validateCredentials(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not registered"));
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (!user.isVerified()) {
            throw new RuntimeException("Account not verified. Please complete signup.");
        }
        return user;
    }

    public String initForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("If the email exists, you'll receive an OTP")); // Generic
        otpService.generateAndSendOtp(email);
        return "If the email exists, you'll receive an OTP";
    }

    @Transactional
    public String verifyForgotPassword(String email, String otp, String newPassword) {
        if (otpService.verifyOtp(email, otp)) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            return "Password reset successful";
        } else {
            throw new RuntimeException("Invalid or expired OTP");
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
