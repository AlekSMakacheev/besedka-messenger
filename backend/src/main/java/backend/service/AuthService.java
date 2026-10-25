package backend.service;

import backend.dto.RegisterRequest;
import backend.entity.User;
import backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository,
                     PasswordEncoder passwordEncoder,
                     JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public boolean register(RegisterRequest request) {

    if(userRepository.findByUsername(request.getUsername()).isPresent()) {
      return false;
    }

    User user = new User();
    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setCreatedAt(LocalDateTime.now());

    userRepository.save(user);

    return true;
  }

  public String login(String username, String password) {

    var userOpt = userRepository.findByUsername(username);
    if (userOpt.isEmpty()) {
      return null;
    }

    var user = userOpt.get();
    if(!passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }

    return jwtService.generateToken(username);

  }
}
