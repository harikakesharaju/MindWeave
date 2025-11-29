package com.myProjects.mindWeave.repositories;

import com.myProjects.mindWeave.entities.Streak;
import com.myProjects.mindWeave.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StreakRepository extends JpaRepository<Streak, Long> {
    Optional<Streak> findByUser1AndUser2(User user1, User user2);
    Optional<Streak> findByUserPairKey(String userPairKey);
}