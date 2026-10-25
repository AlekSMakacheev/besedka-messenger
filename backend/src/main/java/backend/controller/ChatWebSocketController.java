package backend.controller;

import backend.dto.TypingMessage;
import backend.entity.Message;
import backend.entity.User;
import backend.repository.MessageRepository;
import backend.repository.UserRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class ChatWebSocketController {

  private final MessageRepository messageRepository;
  private final UserRepository userRepository;
  private final SimpMessagingTemplate messagingTemplate;


  public ChatWebSocketController(MessageRepository messageRepository,
                                 UserRepository userRepository,
                                 SimpMessagingTemplate messagingTemplate) {
    this.messageRepository = messageRepository;
    this.userRepository = userRepository;
    this.messagingTemplate = messagingTemplate;
  }

  @MessageMapping("/chat/send")
  public void sendMessage(@Payload Message request,
                          SimpMessageHeaderAccessor accessor) {

    System.out.println("TEMP ID = " + request.getTempId());

    Principal principal = accessor.getUser();

    // 🔥 fallback если Spring тупит
    if (principal == null) {

      System.out.println("❌ PRINCIPAL NULL → берем из session");

      String username = (String) accessor.getSessionAttributes().get("username");

      if (username == null) {
        throw new RuntimeException("NO PRINCIPAL");
      }

      principal = () -> username;
    }

    String username = principal.getName();

    System.out.println("WS USER: " + username);

    User sender = userRepository.findByUsername(username)
            .orElseThrow();

    User receiver = userRepository.findByUsername(
            request.getReceiver().getUsername()
    ).orElseThrow();

    Message message = new Message();
    message.setContent(request.getContent());
    message.setSender(sender);
    message.setReceiver(receiver);
    message.setCreatedAt(LocalDateTime.now());

    message.setTempId(request.getTempId());

    message.setRead(false);

    Message saved = messageRepository.save(message);

    System.out.println("SENDING TO: " + "/topic/chat/" + receiver.getUsername());

    messagingTemplate.convertAndSend(
            "/topic/chat/" + receiver.getUsername(),
            saved
    );

    messagingTemplate.convertAndSend(
            "/topic/chat/" + sender.getUsername(),
            saved
    );
  }

  @MessageMapping("/typing")
  public void handleTyping(@Payload TypingMessage typingMessage) {
    messagingTemplate.convertAndSend(
            "/topic/typing/" + typingMessage.getReceiver(),
            typingMessage
    );
  }
}
