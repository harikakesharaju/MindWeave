package com.myProjects.mindWeave.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.myProjects.mindWeave.entities.Post;
import com.myProjects.mindWeave.entities.PostReaction;
import com.myProjects.mindWeave.entities.User;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {

    Optional<PostReaction> findByPostAndUser(Post post, User user);

    long countByPostAndLikedTrue(Post post);

    long countByPostAndDislikedTrue(Post post);
    
    @Query("SELECT COUNT(r) FROM PostReaction r " +
            "JOIN r.post p " +
            "JOIN p.user postOwner " +
            "WHERE postOwner.userId = :loggedInUserId " +
            "AND (r.liked = true OR r.disliked = true) " +
            "AND r.timestamp > (SELECT u.lastReactionCheckTimestamp FROM User u WHERE u.userId = :loggedInUserId)")
     Long countUnreadReactionsForUser(@Param("loggedInUserId") Long loggedInUserId);
    
    @Query("SELECT r FROM PostReaction r " +
            "JOIN r.post p " +
            "JOIN p.user postOwner " +
            "WHERE postOwner.userId = :loggedInUserId " +
            "AND (r.liked = true OR r.disliked = true) " +
            "AND r.timestamp > (SELECT u.lastReactionCheckTimestamp FROM User u WHERE u.userId = :loggedInUserId) " +
            "ORDER BY r.timestamp DESC")
     List<PostReaction> findUnreadReactionsForUser(@Param("loggedInUserId") Long loggedInUserId);}
