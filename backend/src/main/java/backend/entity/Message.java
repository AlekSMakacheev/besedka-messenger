package backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "messages")
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String content;

  @ManyToOne
  private User sender;

  @ManyToOne
  private User receiver;

  private LocalDateTime createdAt;

  @Column(nullable = true)
  private Long tempId;

  private boolean read;

  @Column(columnDefinition = "boolean default false")
  private boolean edited = false;

  public Message() {
  }

  public Message(Long id, String content, User sender, User receiver, LocalDateTime createdAt, Long tempId, boolean read, boolean edited) {
    this.id = id;
    this.content = content;
    this.sender = sender;
    this.receiver = receiver;
    this.createdAt = createdAt;
    this.tempId = tempId;
    this.read = read;
    this.edited = edited;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Message message)) return false;
    return read == message.read && edited == message.edited && Objects.equals(id, message.id) && Objects.equals(content, message.content) && Objects.equals(sender, message.sender) && Objects.equals(receiver, message.receiver) && Objects.equals(createdAt, message.createdAt) && Objects.equals(tempId, message.tempId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, content, sender, receiver, createdAt, tempId, read, edited);
  }

  @Override
  public String toString() {
    return "Message{" +
            "id=" + id +
            ", content='" + content + '\'' +
            ", sender=" + sender +
            ", receiver=" + receiver +
            ", createdAt=" + createdAt +
            ", tempId=" + tempId +
            ", read=" + read +
            ", edited=" + edited +
            '}';
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public User getSender() {
    return sender;
  }

  public void setSender(User sender) {
    this.sender = sender;
  }

  public User getReceiver() {
    return receiver;
  }

  public void setReceiver(User receiver) {
    this.receiver = receiver;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public Long getTempId() {
    return tempId;
  }

  public void setTempId(Long tempId) {
    this.tempId = tempId;
  }

  public boolean isRead() {
    return read;
  }

  public void setRead(boolean read) {
    this.read = read;
  }

  public boolean isEdited() {
    return edited;
  }

  public void setEdited(boolean edited) {
    this.edited = edited;
  }
}
