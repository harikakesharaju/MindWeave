package com.myProjects.mindWeave.services;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myProjects.mindWeave.dto.StreakDto;
import com.myProjects.mindWeave.entities.Streak;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.PostRepository;
import com.myProjects.mindWeave.repositories.StreakRepository;
import com.myProjects.mindWeave.repositories.UserRepository;

@Service
public class StreakServiceImpl implements StreakService {

	@Autowired
	private StreakRepository streakRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PostRepository postRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	private static final ZoneId STREAK_ZONE = ZoneId.of("Asia/Kolkata");

	private String generateUserPairKey(Long id1, Long id2) {

		return id1 < id2 ? id1 + "-" + id2 : id2 + "-" + id1;
	}

	/*
	 * PostgreSQL transaction-level advisory lock.
	 *
	 * Both profile requests for the same pair will acquire the same lock.
	 *
	 * The lock is automatically released when the transaction commits or rolls
	 * back.
	 */
	private void acquirePairLock(String pairKey) {

		jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {

			try (PreparedStatement statement = connection
					.prepareStatement("SELECT pg_advisory_xact_lock(" + "hashtextextended(?, 0))")) {

				statement.setString(1, pairKey);
				statement.execute();
			}

			return null;
		});
	}

	private boolean follows(User user1, User user2) {

		return user1.getFollows().stream().anyMatch(u -> u.getUserId().equals(user2.getUserId()));
	}

	private boolean areMutualFollowers(User user1, User user2) {

		return follows(user1, user2) && follows(user2, user1);
	}

	/*
	 * Convert IST calendar-day boundaries into UTC.
	 *
	 * PostgreSQL timestamp column contains UTC values represented as LocalDateTime.
	 */
	private LocalDateTime getUtcStartOfDay(LocalDate date) {

		return date.atStartOfDay(STREAK_ZONE).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
	}

	private LocalDateTime getUtcStartOfNextDay(LocalDate date) {

		return date.plusDays(1).atStartOfDay(STREAK_ZONE).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
	}

	private boolean hasPostedToday(Long userId, LocalDate today) {

		LocalDateTime start = getUtcStartOfDay(today);

		LocalDateTime end = getUtcStartOfNextDay(today);

		return postRepository.existsByUser_UserIdAndTimestampGreaterThanEqualAndTimestampLessThan(userId, start, end);
	}

	@Override
	@Transactional
	public void updateStreakOnProfileView(Long viewerId, Long profileUserId) {

		if (viewerId == null || profileUserId == null || viewerId.equals(profileUserId)) {
			return;
		}

		String pairKey = generateUserPairKey(viewerId, profileUserId);

		// 1. Lock the user pair.
		acquirePairLock(pairKey);

		// 2. Fetch users.
		User viewer = userRepository.findById(viewerId).orElse(null);

		User profileUser = userRepository.findById(profileUserId).orElse(null);

		if (viewer == null || profileUser == null) {
			return;
		}

		// 3. Check mutual following.
		if (!areMutualFollowers(viewer, profileUser)) {
			return;
		}

		// 4. Get today's IST date.
		LocalDate today = LocalDate.now(STREAK_ZONE);

		LocalDate yesterday = today.minusDays(1);

		// 5. Find all dates on which both users posted.
		List<Date> sqlDates = postRepository.findMutualPostingDates(viewerId, profileUserId);

		List<LocalDate> sharedDates = sqlDates.stream().map(Date::toLocalDate).toList();

		// 6. Find existing streak.
		Optional<Streak> existing = streakRepository.findByUserPairKey(pairKey);

		Streak streak;

		if (existing.isPresent()) {

			streak = existing.get();

		} else {

			streak = new Streak();

			if (viewerId < profileUserId) {

				streak.setUser1(viewer);
				streak.setUser2(profileUser);

			} else {

				streak.setUser1(profileUser);
				streak.setUser2(viewer);
			}

			streak.setUserPairKey(pairKey);
		}

		// 7. Check the most recent shared posting date.
		LocalDate latestSharedDate = sharedDates.isEmpty() ? null : sharedDates.get(0);
		
		if (existing.isEmpty()
		        && !today.equals(latestSharedDate)
		        && !yesterday.equals(latestSharedDate)) {
		    return;
		}

		/*
		 * CASE 1: Both posted today.
		 */
		if (today.equals(latestSharedDate)) {

			int currentStreak = countConsecutiveDays(sharedDates, today);

			streak.setStreakLength(currentStreak);

			streak.setLastPostSharedDate(today);

			streakRepository.save(streak);

			return;
		}

		/*
		 * CASE 2: Both posted yesterday but not yet today.
		 *
		 * Preserve the streak because today is not over.
		 */
		if (yesterday.equals(latestSharedDate)) {

			int currentStreak = countConsecutiveDays(sharedDates, yesterday);

			streak.setStreakLength(currentStreak);

			streak.setLastPostSharedDate(yesterday);

			streakRepository.save(streak);

			return;
		}

		/*
		 * CASE 3: A complete calendar day was missed.
		 */
		streak.setStreakLength(0);

		streak.setLastPostSharedDate(null);

		streakRepository.save(streak);
	}

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

	@Override
	@Transactional(readOnly = true)
	public StreakDto getStreakByUserPair(Long user1Id, Long user2Id) {

		if (user1Id == null || user2Id == null || user1Id.equals(user2Id)) {

			return null;
		}

		String pairKey = generateUserPairKey(user1Id, user2Id);

		return streakRepository.findByUserPairKey(pairKey).map(this::convertToDto).orElse(null);
	}

	private int countConsecutiveDays(List<LocalDate> sharedDates, LocalDate startingDate) {

		int count = 0;

		LocalDate expectedDate = startingDate;

		for (LocalDate date : sharedDates) {

			if (date.equals(expectedDate)) {

				count++;
				expectedDate = expectedDate.minusDays(1);

			} else if (date.isBefore(expectedDate)) {

				// A complete day was missed.
				break;
			}
		}

		return count;
	}
}