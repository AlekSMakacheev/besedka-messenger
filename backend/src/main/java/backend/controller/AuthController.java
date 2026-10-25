package backend.controller;

import backend.dto.RegisterRequest;
import backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

    boolean created = authService.register(request);

    if (!created) {
      return ResponseEntity
              .badRequest()
              .body("User already exists");
    }

    return ResponseEntity.ok("User created!");
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody RegisterRequest request) {

    String token = authService.login(request.getUsername(), request.getPassword());

    if (token == null) {
      return ResponseEntity.badRequest().body("Invalid credentials");
    }

    return ResponseEntity.ok(token);
  }



}

