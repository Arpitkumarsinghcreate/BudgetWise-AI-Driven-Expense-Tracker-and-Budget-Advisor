package com.expense.tracker.service;

import com.expense.tracker.entity.Otp;
import com.expense.tracker.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public void generateAndSendOtp(String email) {
        // Generate 6-digit OTP
        String otpCode = String.valueOf(new Random().nextInt(900000) + 100000);

        // Save or Update OTP
        Otp otp = otpRepository.findByEmail(email).orElse(new Otp());
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        
        otpRepository.save(otp);

        // Send Email
        emailService.sendOtpEmail(email, otpCode);
    }

    @Transactional
    public boolean verifyOtp(String email, String otpCode) {
        Optional<Otp> otpOptional = otpRepository.findByEmail(email);
        
        if (otpOptional.isPresent()) {
            Otp otp = otpOptional.get();
            if (otp.getOtpCode().equals(otpCode) && otp.getExpiryTime().isAfter(LocalDateTime.now())) {
                // OTP is valid and not expired
                otpRepository.delete(otp); // Ensure one-time use
                return true;
            }
        }
        return false;
    }
}
