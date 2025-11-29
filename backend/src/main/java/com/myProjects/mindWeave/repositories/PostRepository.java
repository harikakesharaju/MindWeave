package com.myProjects.mindWeave.repositories;

import com.myProjects.mindWeave.entities.Post;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // You can add custom query methods here if needed
	List<Post> findByUser_UserId(Long userId);
	 boolean existsByUser_UserIdAndTimestampBetween(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);
}