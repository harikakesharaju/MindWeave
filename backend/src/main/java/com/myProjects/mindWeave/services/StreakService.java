package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.StreakDto;
import com.myProjects.mindWeave.entities.User;

public interface StreakService {
    void updateStreaksOnNewPost(User poster);
    StreakDto getStreakByUserPair(Long user1Id, Long user2Id);
    public void checkAndResetDailyStreaks() ;
}