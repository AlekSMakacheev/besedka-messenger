package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(nullable = false)
  @JsonIgnore
  private String password;

  private LocalDateTime createdAt;

  private LocalDateTime lastSeenAt;

  public User() {
  }

  public User(Long id, String username, String password, LocalDateTime createdAt, LocalDateTime lastSeenAt) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.createdAt = createdAt;
    this.lastSeenAt = lastSeenAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof User user)) return false;
    return Objects.equals(id, user.id) && Objects.equals(username, user.username) && Objects.equals(password, user.password) && Objects.equals(createdAt, user.createdAt) && Objects.equals(lastSeenAt, user.lastSeenAt);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, username, password, createdAt, lastSeenAt);
  }

  @Override
  public String toString() {
    return "User{" +
            "id=" + id +
            ", username='" + username + '\'' +
            ", password='" + password + '\'' +
            ", createdAt=" + createdAt +
            ", lastSeenAt=" + lastSeenAt +
            '}';
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getLastSeenAt() {
    return lastSeenAt;
  }

  public void setLastSeenAt(LocalDateTime lastSeenAt) {
    this.lastSeenAt = lastSeenAt;
  }
}
