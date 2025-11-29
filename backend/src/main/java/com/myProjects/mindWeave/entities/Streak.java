package com.myProjects.mindWeave.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "streaks")
//@Data
@NoArgsConstructor
@AllArgsConstructor
public class Streak {

    public Long getStreakId() {
		return streakId;
	}

	public void setStreakId(Long streakId) {
		this.streakId = streakId;
	}

	public User getUser1() {
		return user1;
	}

	public void setUser1(User user1) {
		this.user1 = user1;
	}

	public User getUser2() {
		return user2;
	}

	public void setUser2(User user2) {
		this.user2 = user2;
	}

	public int getStreakLength() {
		return streakLength;
	}

	public void setStreakLength(int streakLength) {
		this.streakLength = streakLength;
	}

	public LocalDate getLastPostSharedDate() {
		return lastPostSharedDate;
	}

	public void setLastPostSharedDate(LocalDate lastPostSharedDate) {
		this.lastPostSharedDate = lastPostSharedDate;
	}

	public String getUserPairKey() {
		return userPairKey;
	}

	public void setUserPairKey(String userPairKey) {
		this.userPairKey = userPairKey;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long streakId;

    @ManyToOne
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    private int streakLength;

    private LocalDate lastPostSharedDate;

    @Column(unique = true)
    private String userPairKey; // To easily find streaks between two users
}