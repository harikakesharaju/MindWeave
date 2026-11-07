package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.StreakDto;

public interface StreakService {

    void updateStreakOnProfileView(
            Long viewerId,
            Long profileUserId
    );

    StreakDto getStreakByUserPair(
            Long user1Id,
            Long user2Id
    );
}