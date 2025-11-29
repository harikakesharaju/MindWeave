package com.myProjects.mindWeave.dto;

import java.time.LocalDate;

public class StreakDto {
    private Long streakId;
    private Long user1Id;
    private String user1Username;
    private Long user2Id;
    private String user2Username;
    private int streakLength;
    private LocalDate lastPostSharedDate;
	public Long getStreakId() {
		return streakId;
	}
	public void setStreakId(Long streakId) {
		this.streakId = streakId;
	}
	public Long getUser1Id() {
		return user1Id;
	}
	public void setUser1Id(Long user1Id) {
		this.user1Id = user1Id;
	}
	public String getUser1Username() {
		return user1Username;
	}
	public void setUser1Username(String user1Username) {
		this.user1Username = user1Username;
	}
	public Long getUser2Id() {
		return user2Id;
	}
	public void setUser2Id(Long user2Id) {
		this.user2Id = user2Id;
	}
	public String getUser2Username() {
		return user2Username;
	}
	public void setUser2Username(String user2Username) {
		this.user2Username = user2Username;
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

    // Getters and setters...
}