package com.myProjects.mindWeave.repositories;

import com.myProjects.mindWeave.entities.Streak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StreakRepository
        extends JpaRepository<Streak, Long> {

    Optional<Streak> findByUserPairKey(String userPairKey);

}