package com.expense.tracker.controller;

import com.expense.tracker.dto.LoginRequest;
import com.expense.tracker.dto.SignupRequest;
import com.expense.tracker.dto.VerifyOtpRequest;
import com.expense.tracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"}, allowedHeaders = "*", methods = {RequestMethod.POST})
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private com.expense.tracker.security.JwtUtil jwtUtil;

    @PostMapping("/signup/init")
    public ResponseEntity<String> initSignup(@Valid @RequestBody SignupRequest request) {
        try {
            String response = userService.initSignup(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<String> verifySignup(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            String response = userService.verifySignup(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login/init")
    public ResponseEntity<String> initLogin(@Valid @RequestBody LoginRequest request) {
        try {
            String response = userService.initLogin(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login/verify")
    public ResponseEntity<String> verifyLogin(@Valid @RequestBody VerifyOtpRequest request) {
        try {
            String response = userService.verifyLogin(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

  @PostMapping("/forgot-password/init")
  public ResponseEntity<String> initForgotPassword(@RequestBody java.util.Map<String, String> payload) {
    try {
      String email = payload.get("email");
      String response = userService.initForgotPassword(email);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      return ResponseEntity.ok("If the email exists, you'll receive an OTP");
    }
  }

  @PostMapping("/forgot-password/verify")
  public ResponseEntity<String> verifyForgotPassword(@RequestBody java.util.Map<String, String> payload) {
    try {
      String email = payload.get("email");
      String otp = payload.get("otp");
      String newPassword = payload.get("newPassword");
      String response = userService.verifyForgotPassword(email, otp, newPassword);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  @PostMapping("/me")
  public ResponseEntity<java.util.Map<String, String>> getProfile(@RequestBody java.util.Map<String, String> payload) {
    String email = payload.get("email");
    com.expense.tracker.entity.User user = userService.findByEmail(email);
    java.util.Map<String, String> resp = new java.util.HashMap<>();
    resp.put("id", String.valueOf(user.getId()));
    resp.put("email", user.getEmail());
    resp.put("name", user.getName());
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/token")
  public ResponseEntity<java.util.Map<String, String>> token(@Valid @RequestBody LoginRequest request) {
    try {
      com.expense.tracker.entity.User user = userService.validateCredentials(request);
      String token = jwtUtil.generateToken(user.getEmail(), java.util.Map.of("userId", user.getId()));
      return ResponseEntity.ok(java.util.Map.of("token", token));
    } catch (RuntimeException e) {
      return ResponseEntity.status(401).body(java.util.Map.of("error", e.getMessage()));
    }
  }
}
