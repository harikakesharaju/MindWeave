package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.StreakDto;
import com.myProjects.mindWeave.entities.Post;
import com.myProjects.mindWeave.entities.Streak;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.PostRepository;
import com.myProjects.mindWeave.repositories.StreakRepository;
import com.myProjects.mindWeave.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation; // <-- IMPORT THIS

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class StreakServiceImpl implements StreakService {

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    private StreakDto convertToDto(Streak streak) {
        StreakDto dto = new StreakDto();
        dto.setStreakId(streak.getStreakId());
        dto.setUser1Id(streak.getUser1().getUserId());
        dto.setUser1Username(streak.getUser1().getUsername());
        dto.setUser2Id(streak.getUser2().getUserId());
        dto.setUser2Username(streak.getUser2().getUsername());
        dto.setStreakLength(streak.getStreakLength());
        dto.setLastPostSharedDate(streak.getLastPostSharedDate());
        return dto;
    }

    private String generateUserPairKey(Long id1, Long id2) {
        return (id1 < id2) ? id1 + "-" + id2 : id2 + "-" + id1;
    }

    @Transactional
    public void resetBrokenStreaks(LocalDate yesterday) {

        List<Streak> all = streakRepository.findAll();

        for (Streak streak : all) {

            boolean user1Posted =
                    hasUserPostedOnDay(streak.getUser1().getUserId(), yesterday);

            boolean user2Posted =
                    hasUserPostedOnDay(streak.getUser2().getUserId(), yesterday);

            if (!(user1Posted && user2Posted)) {

                streak.setStreakLength(0);
                streak.setLastPostSharedDate(null);

                streakRepository.save(streak);
            }
        }
    }
    
    @Transactional
    public void checkAndResetDailyStreaks() {

        LocalDate yesterday = LocalDate.now().minusDays(1);

        LocalDateTime start = yesterday.atStartOfDay();
        LocalDateTime end = yesterday.atTime(LocalTime.MAX);

        // users who posted yesterday
        List<Long> activeUsers =
                postRepository.findDistinctUserIdsByTimestampBetween(start, end);

        for (Long userId : activeUsers) {

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;

            for (User followed : user.getFollows()) {

                if (!activeUsers.contains(followed.getUserId()))
                    continue;

                if (!followed.getFollows().contains(user))
                    continue;

                if (user.getUserId() > followed.getUserId())
                    continue;

                String pairKey =
                        generateUserPairKey(user.getUserId(), followed.getUserId());

                Optional<Streak> existing =
                        streakRepository.findByUserPairKey(pairKey);

                if (existing.isPresent()) {

                    Streak streak = existing.get();
                    streak.setStreakLength(streak.getStreakLength() + 1);
                    streak.setLastPostSharedDate(yesterday);

                    streakRepository.save(streak);

                } else {

                    Streak streak = new Streak();
                    streak.setUser1(user);
                    streak.setUser2(followed);
                    streak.setStreakLength(1);
                    streak.setLastPostSharedDate(yesterday);
                    streak.setUserPairKey(pairKey);

                    streakRepository.save(streak);
                }
            }
        }

        resetBrokenStreaks(yesterday);
    }

    // Helper method to check if a user posted on a specific date
    private boolean hasUserPostedOnDay(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return postRepository.existsByUser_UserIdAndTimestampBetween(userId, startOfDay, endOfDay);
    }


    @Override
    @Transactional
    public StreakDto getStreakByUserPair(Long user1Id, Long user2Id) {
        Optional<User> user1Optional = userRepository.findById(user1Id);
        Optional<User> user2Optional = userRepository.findById(user2Id);
        if (user1Optional.isPresent() && user2Optional.isPresent()) {
            String pairKey = generateUserPairKey(user1Id, user2Id);
            Optional<Streak> streakOptional = streakRepository.findByUserPairKey(pairKey);
            return streakOptional.map(this::convertToDto).orElse(null);
        }
        return null;
    }
}

//This ensures that when a post is created, the streak update is a rapid, isolated database operation, releasing the lock quickly and preventing the lock wait timeout for subsequent requests.