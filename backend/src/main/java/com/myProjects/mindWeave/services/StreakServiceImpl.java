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

    /**
     * Updates the last shared date or creates a new streak record.
     * Uses Propagation.REQUIRES_NEW to isolate the locking and DB operation.
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW) // <-- REQUIRED CHANGE
    public void updateStreaksOnNewPost(User poster) {
        LocalDate today = LocalDate.now();

        // For all mutual followers, set their lastPostSharedDate for this pair to 'today'
        for (User follower : poster.getFollowers()) {
            if (poster.getFollows().contains(follower)) { // Check for mutual follow
                User user1 = poster;
                User user2 = follower;

                // Ensure user1 has the smaller ID for consistent pairKey
                if (user1.getUserId() > user2.getUserId()) {
                    User temp = user1;
                    user1 = user2;
                    user2 = temp;
                }
                String pairKey = generateUserPairKey(user1.getUserId(), user2.getUserId());
                
                // The repository call acquires the PESSIMISTIC_WRITE lock here.
                Optional<Streak> existingStreakOptional = streakRepository.findByUserPairKey(pairKey);

                if (existingStreakOptional.isPresent()) {
                    Streak streak = existingStreakOptional.get();
                    // Just update the lastPostSharedDate to today.
                    streak.setLastPostSharedDate(today);
                    // Lock is released upon commit of this REQUIRES_NEW transaction.
                    streakRepository.save(streak);
                } else {
                    // Create a new streak, initial length is 1, last shared date is today.
                    Streak newStreak = new Streak();
                    newStreak.setUser1(user1);
                    newStreak.setUser2(user2);
                    newStreak.setStreakLength(1); // Initial streak length
                    newStreak.setLastPostSharedDate(today);
                    newStreak.setUserPairKey(pairKey);
                    // Lock is released upon commit of this REQUIRES_NEW transaction.
                    streakRepository.save(newStreak);
                }
            }
        }
    }

    // --- Daily streak check method (usually called by scheduler) ---
    @Transactional
    public void checkAndResetDailyStreaks() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate today = LocalDate.now();

        // 1. Get all existing streaks
        List<Streak> allStreaks = streakRepository.findAll();

        for (Streak streak : allStreaks) {
            User user1 = streak.getUser1();
            User user2 = streak.getUser2();

            if (streak.getLastPostSharedDate() == null || streak.getLastPostSharedDate().isBefore(today)) {

                // Check if BOTH users posted yesterday
                boolean user1PostedYesterday = hasUserPostedOnDay(user1.getUserId(), yesterday);
                boolean user2PostedYesterday = hasUserPostedOnDay(user2.getUserId(), yesterday);

                if (user1PostedYesterday && user2PostedYesterday) {
                    // Both posted yesterday, increment streak
                    streak.setStreakLength(streak.getStreakLength() + 1);
                    streak.setLastPostSharedDate(yesterday); // Update this to yesterday
                } else {
                    // If either did not post yesterday, reset the streak
                    streak.setStreakLength(0); // Reset to 0 as they broke the streak
                    streak.setLastPostSharedDate(null); // Clear the last shared date
                }
                streakRepository.save(streak);
            }
        }
    }

    // Helper method to check if a user posted on a specific date
    private boolean hasUserPostedOnDay(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return postRepository.existsByUser_UserIdAndTimestampBetween(userId, startOfDay, endOfDay);
    }


    @Override
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