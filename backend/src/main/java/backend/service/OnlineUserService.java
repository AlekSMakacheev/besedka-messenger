package backend.service;

import backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OnlineUserService {

  private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();
  private final UserRepository userRepository;

  public OnlineUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public void userConnected(String username) {
    onlineUsers.add(username);
  }

  public void userDisconnected(String username) {
    onlineUsers.remove(username);
  }

  public boolean isOnline(String username) {
    return onlineUsers.contains(username);
  }

  public Set<String> getOnlineUsers() {
    return onlineUsers;
  }

  public void updateLastSeen(String username) {
    userRepository.findByUsername(username).ifPresent(user -> {
      user.setLastSeenAt(LocalDateTime.now());
      userRepository.save(user);
    });
  }
}
