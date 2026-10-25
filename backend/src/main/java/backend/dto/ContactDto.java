package backend.dto;

import java.time.LocalDateTime;
import java.util.Objects;

public class ContactDto {

  private String username;
  private String lastMessage;
  private LocalDateTime lastMessageTime;
  private long unreadCount;
  private LocalDateTime lastSeenAt;

  public ContactDto() {
  }

  public ContactDto(String username, String lastMessage, LocalDateTime lastMessageTime, long unreadCount, LocalDateTime lastSeenAt) {
    this.username = username;
    this.lastMessage = lastMessage;
    this.lastMessageTime = lastMessageTime;
    this.unreadCount = unreadCount;
    this.lastSeenAt = lastSeenAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof ContactDto that)) return false;
    return unreadCount == that.unreadCount && Objects.equals(username, that.username) && Objects.equals(lastMessage, that.lastMessage) && Objects.equals(lastMessageTime, that.lastMessageTime) && Objects.equals(lastSeenAt, that.lastSeenAt);
  }

  @Override
  public int hashCode() {
    return Objects.hash(username, lastMessage, lastMessageTime, unreadCount, lastSeenAt);
  }

  @Override
  public String toString() {
    return "ContactDto{" +
            "username='" + username + '\'' +
            ", lastMessage='" + lastMessage + '\'' +
            ", lastMessageTime=" + lastMessageTime +
            ", unreadCount=" + unreadCount +
            ", lastSeenAt=" + lastSeenAt +
            '}';
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getLastMessage() {
    return lastMessage;
  }

  public void setLastMessage(String lastMessage) {
    this.lastMessage = lastMessage;
  }

  public LocalDateTime getLastMessageTime() {
    return lastMessageTime;
  }

  public void setLastMessageTime(LocalDateTime lastMessageTime) {
    this.lastMessageTime = lastMessageTime;
  }

  public long getUnreadCount() {
    return unreadCount;
  }

  public void setUnreadCount(long unreadCount) {
    this.unreadCount = unreadCount;
  }

  public LocalDateTime getLastSeenAt() {
    return lastSeenAt;
  }

  public void setLastSeenAt(LocalDateTime lastSeenAt) {
    this.lastSeenAt = lastSeenAt;
  }
}
