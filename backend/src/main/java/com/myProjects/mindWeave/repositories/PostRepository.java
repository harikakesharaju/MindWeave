package com.myProjects.mindWeave.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.myProjects.mindWeave.entities.Post;
import java.sql.Date;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // You can add custom query methods here if needed
	List<Post> findByUser_UserId(Long userId);

	 
	 boolean existsByUser_UserIdAndTimestampGreaterThanEqualAndTimestampLessThan(
		        Long userId,
		        LocalDateTime start,
		        LocalDateTime end
		);
	 
	 @Query(value = """
			    SELECT
			        ((p.timestamp AT TIME ZONE 'UTC')
			         AT TIME ZONE 'Asia/Kolkata')::date AS post_day
			    FROM posts p
			    WHERE p.user_id IN (:user1Id, :user2Id)
			    GROUP BY post_day
			    HAVING COUNT(DISTINCT p.user_id) = 2
			    ORDER BY post_day DESC
			    """, nativeQuery = true)
			List<Date> findMutualPostingDates(
			        @Param("user1Id") Long user1Id,
			        @Param("user2Id") Long user2Id
			);
}