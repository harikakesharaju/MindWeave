package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.StreakDto;
import com.myProjects.mindWeave.entities.Post; // Import Post entity
import com.myProjects.mindWeave.entities.Streak;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.PostRepository; // Inject PostRepository
import com.myProjects.mindWeave.repositories.StreakRepository;
import com.myProjects.mindWeave.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime; // For Post timestamp check
import java.time.LocalTime; // For Post timestamp check
import java.util.List;
import java.util.Optional;

@Service
public class StreakServiceImpl implements StreakService {

    @Autowired
    private StreakRepository streakRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository; // Inject PostRepository

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

    // This method's primary role will now be to establish a potential new streak or
    // update the 'lastPostSharedDate' for an existing streak. The actual
    // streak length increment/reset will be managed by the daily scheduler.
    @Override
    @Transactional
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
                Optional<Streak> existingStreakOptional = streakRepository.findByUserPairKey(pairKey);

                if (existingStreakOptional.isPresent()) {
                    Streak streak = existingStreakOptional.get();
                    // Just update the lastPostSharedDate to today.
                    // The streakLength will be managed by the daily scheduler.
                    streak.setLastPostSharedDate(today);
                    streakRepository.save(streak);
                } else {
                    // Create a new streak, initial length is 1, last shared date is today.
                    Streak newStreak = new Streak();
                    newStreak.setUser1(user1);
                    newStreak.setUser2(user2);
                    newStreak.setStreakLength(1); // Initial streak length
                    newStreak.setLastPostSharedDate(today);
                    newStreak.setUserPairKey(pairKey);
                    streakRepository.save(newStreak);
                }
            }
        }
    }

    // --- New method for daily streak check and update (to be called by scheduler) ---
    @Transactional
    public void checkAndResetDailyStreaks() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate today = LocalDate.now();

        // 1. Get all existing streaks
        List<Streak> allStreaks = streakRepository.findAll();

        for (Streak streak : allStreaks) {
            User user1 = streak.getUser1();
            User user2 = streak.getUser2();

            // Only process streaks that were active up to yesterday or before today
            // If lastPostSharedDate is today, it means someone already posted today and it's already counted for tomorrow's check.
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
        // After iterating through all streaks and processing for 'yesterday',
        // we can now check for today for any new posts that might have occurred.
        // This is handled by `updateStreaksOnNewPost` when a post is made.
        // The scheduler's role is specifically to process the *previous* day's activity.
    }

    // Helper method to check if a user posted on a specific date
    private boolean hasUserPostedOnDay(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX); // Max time of the day

        // Assuming Post has a 'timestamp' field (LocalDateTime) and a 'user' field
        // You might need to add a method to PostRepository for this.
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