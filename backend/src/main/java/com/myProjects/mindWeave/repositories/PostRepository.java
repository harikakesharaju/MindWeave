package com.myProjects.mindWeave.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.myProjects.mindWeave.entities.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // You can add custom query methods here if needed
	List<Post> findByUser_UserId(Long userId);
	 boolean existsByUser_UserIdAndTimestampBetween(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);
	 
	 @Query("""
			 SELECT DISTINCT p.user.userId
			 FROM Post p
			 WHERE p.timestamp BETWEEN :start AND :end
			 """)
			 List<Long> findDistinctUserIdsByTimestampBetween(
			         LocalDateTime start,
			         LocalDateTime end
			 );
}