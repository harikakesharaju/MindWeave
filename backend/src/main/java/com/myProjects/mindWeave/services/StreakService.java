package com.myProjects.mindWeave.services;

import java.time.LocalDate;

import com.myProjects.mindWeave.dto.StreakDto;
import com.myProjects.mindWeave.entities.User;

public interface StreakService {
    StreakDto getStreakByUserPair(Long user1Id, Long user2Id);
    public void checkAndResetDailyStreaks() ;
    public void resetBrokenStreaks(LocalDate yesterday);
}