package backend.repository;

import backend.entity.Message;
import backend.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

  List<Message> findBySenderAndReceiver(User sender, User receiver);

  @Query("""
    SELECT m FROM Message m
    WHERE 
        (m.sender.username = :user1 AND m.receiver.username = :user2)
        OR
        (m.sender.username = :user2 AND m.receiver.username = :user1)
    ORDER BY m.createdAt
  """)
  List<Message> findChat(@Param("user1") String user1,
                         @Param("user2") String user2);

  @Query("""
  SELECT DISTINCT 
    CASE 
      WHEN m.sender.username = :username THEN m.receiver.username
      ELSE m.sender.username
    END
  FROM Message m
  WHERE m.sender.username = :username OR m.receiver.username = :username
  """)
  List<String> findDialogs(@Param("username") String username);

  @Query("""
    SELECT m FROM Message m
    WHERE
      (m.sender.username = :user1 AND m.receiver.username = :user2)
      OR
      (m.sender.username = :user2 AND m.receiver.username = :user1)
    ORDER BY m.createdAt DESC
  """)
  List<Message> findChatDesc(
          @Param("user1") String user1,
          @Param("user2") String user2
  );

  @Query("""
  SELECT m FROM Message m
  WHERE m.sender.username = :sender
    AND m.receiver.username = :receiver
    AND m.read = false
  """)
  List<Message> findUnreadMessages(
          @Param("sender") String sender,
          @Param("receiver") String receiver
  );

  @Query("""
  SELECT COUNT(m)
  FROM Message m
  WHERE m.sender.username = :contact
  AND m.receiver.username = :currentUser
  AND m.read = false
  """)
  long countUnreadMessages(
          @Param("contact") String contact,
          @Param("currentUser") String currentUser
  );

  @Modifying
  @Transactional
  @Query("UPDATE Message m SET m.read = true WHERE m.sender.username = :sender AND m.receiver.username = :receiver AND m.read = false")
  int markMessagesAsRead(@Param("sender") String sender, @Param("receiver") String receiver);

  @Query("SELECT m FROM Message m WHERE " +
          "((m.sender.username = :user1 AND m.receiver.username = :user2) OR " +
          "(m.sender.username = :user2 AND m.receiver.username = :user1)) " +
          "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))")
  List<Message> searchMessages(@Param("user1") String user1,
                               @Param("user2") String user2,
                               @Param("query") String query);

  @Modifying
  @Transactional
  @Query("DELETE FROM Message m WHERE (m.sender.username = :user1 AND m.receiver.username = :user2) OR (m.sender.username = :user2 AND m.receiver.username = :user1)")
  void deleteDialog(@Param("user1") String user1, @Param("user2") String user2);

}
