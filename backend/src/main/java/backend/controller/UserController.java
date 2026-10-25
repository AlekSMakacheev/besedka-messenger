package backend.controller;

import backend.entity.User;
import backend.repository.UserRepository;
import backend.service.OnlineUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
public class UserController {

  private final UserRepository userRepository;
  private final OnlineUserService onlineUserService;

  public UserController(UserRepository userRepository, OnlineUserService onlineUserService) {
    this.userRepository = userRepository;
    this.onlineUserService = onlineUserService;
  }

  @GetMapping("/users")
  public List<User> getUsers() {
    return userRepository.findAll();
  }

  @GetMapping("/users/online")
  public Set<String> getOnlineUsers() {
    return onlineUserService.getOnlineUsers();
  }

  @GetMapping("/users/search")
  public ResponseEntity<?> searchByUsername(@RequestParam String username) {
    Optional<User> user = userRepository.findByUsername(username);
    if (user.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(user);
  }

}
