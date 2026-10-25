package backend.controller;

import backend.dto.ContactDto;
import backend.entity.Message;
import backend.entity.User;
import backend.repository.MessageRepository;
import backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
public class MessageController {

  private final MessageRepository messageRepository;
  private final UserRepository userRepository;
  private final SimpMessagingTemplate messagingTemplate;

  public MessageController(MessageRepository messageRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
    this.messageRepository = messageRepository;
    this.userRepository = userRepository;
    this.messagingTemplate = messagingTemplate;
  }

  @PostMapping
  public Message sendMessage(@RequestBody Message request) {

    String username = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    User sender = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Sender not found"));

    User receiver = userRepository.findByUsername(
            request.getReceiver().getUsername()
    ).orElseThrow(() -> new RuntimeException("Receiver not found"));

    Message message = new Message();
    message.setContent(request.getContent());
    message.setSender(sender);
    message.setReceiver(receiver);
    message.setCreatedAt(LocalDateTime.now());
    message.setRead(false);

    return  messageRepository.save(message);
  }

  @GetMapping("/chat")
  public List<Message> getChat(@RequestParam String user) {

    String currentUser = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    List<Message> unread =
            messageRepository.findUnreadMessages(
                    user,
                    currentUser
            );

    for (Message message : unread) {
      message.setRead(true);
    }

    messageRepository.saveAll(unread);

    System.out.println("UNREAD FOUND = " + unread.size());

    return messageRepository.findChat(currentUser, user);

  }

  @GetMapping("/dialogs")
  public List<String> getDialogs() {
     String currentUser = SecurityContextHolder
             .getContext()
             .getAuthentication()
             .getName();

     return messageRepository.findDialogs(currentUser);
  }

  @GetMapping("/contacts")
  public List<ContactDto> getContacts() {

    String currentUser = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    List<String> dialogs =
            messageRepository.findDialogs(currentUser);

    List<ContactDto> result = new ArrayList<>();

    for (String username : dialogs) {

      List<Message> chat =
              messageRepository.findChatDesc(
                      currentUser,
                      username
              );

      String lastMessage = "";
      LocalDateTime lastMessageTime = null;

      if (!chat.isEmpty()) {
        lastMessage = chat.get(0).getContent();
        lastMessageTime = chat.get(0).getCreatedAt();
      }

      long unreadCount =
              messageRepository.countUnreadMessages(
                      username,
                      currentUser
              );

      User user = userRepository.findByUsername(username).orElse(null);
      LocalDateTime lastSeenAt = user != null ? user.getLastSeenAt() : null;

      result.add(
              new ContactDto(
                      username,
                      lastMessage,
                      lastMessageTime,
                      unreadCount,
                      lastSeenAt
              )
      );
    }

    result.sort((a, b) -> {
      if(a.getLastMessageTime() == null) return 1;
      if(b.getLastMessageTime() == null) return -1;

      return b.getLastMessageTime()
              .compareTo(a.getLastMessageTime());
    });

    return result;
  }

  @PostMapping("/read/{sender}")
  public ResponseEntity<Void> markAsRead(@PathVariable String sender) {
    String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
    messageRepository.markMessagesAsRead(sender, currentUser);

    Map<String, String> notification = new HashMap<>();
    notification.put("reader", currentUser);
    notification.put("type", "READ_RECEIPT");
    
    messagingTemplate.convertAndSend("/topic/chat/read/" + sender, notification);
    return ResponseEntity.ok().build();
  }

  @PutMapping("/{id}")
  public ResponseEntity<Message> editMessage(@PathVariable Long id,
                                             @RequestBody Map<String, String>
                                             payload) {
    String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
    Message message = messageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));

    if(!message.getSender().getUsername().equals(currentUser)) {
      return ResponseEntity.status(403).build();
    }

    String newContent = payload.get("content");
    if (newContent == null || newContent.trim().isEmpty()) {
      return ResponseEntity.badRequest().build();
    }

    message.setContent(newContent);
    message.setEdited(true);
    Message saved = messageRepository.save(message);

    // Отправляем обновление через WebSocket обоим участникам
    messagingTemplate.convertAndSend("/topic/chat/" + message.getReceiver().getUsername(), saved);
    messagingTemplate.convertAndSend("/topic/chat/" + message.getSender().getUsername(), saved);

    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
    String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
    Message message = messageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));

    if (!message.getSender().getUsername().equals(currentUser)) {
      return ResponseEntity.status(403).build();
    }

    Long deletedId = message.getId();
    String receiverUsername = message.getReceiver().getUsername();
    String senderUsername = message.getSender().getUsername();

    messageRepository.deleteById(id);

    // Отправляем событие удаления (специальный объект)
    Map<String, Object> deleteEvent = Map.of(
            "type", "DELETE",
            "id", deletedId
    );
    messagingTemplate.convertAndSend("/topic/chat/" + receiverUsername, deleteEvent);
    messagingTemplate.convertAndSend("/topic/chat/" + senderUsername, deleteEvent);

    return ResponseEntity.ok().build();
  }

  @GetMapping("/search")
  public List<Message> searchMessages(@RequestParam String q, @RequestParam String with) {
    String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
    return messageRepository.searchMessages(currentUser, with, q);
  }

  @DeleteMapping("/dialog/{with}")
  public ResponseEntity<Void> deleteDialog(@PathVariable String with) {
    String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
    messageRepository.deleteDialog(currentUser, with);
    return ResponseEntity.ok().build();
  }
}
