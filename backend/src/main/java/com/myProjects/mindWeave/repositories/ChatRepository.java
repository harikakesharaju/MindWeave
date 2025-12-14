package com.myProjects.mindWeave.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.myProjects.mindWeave.entities.Chat;
import com.myProjects.mindWeave.entities.User;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    Optional<Chat> findByUser1AndUser2(User user1, User user2);

    List<Chat> findByUser1OrUser2(User user1, User user2);
    
    @Query("SELECT c FROM Chat c WHERE c.user1.userId = :userId OR c.user2.userId = :userId")
    List<Chat> findAllByUser(Long userId);

}
