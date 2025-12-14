package com.myProjects.mindWeave.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Email(message = "Invalid email format")
    @Column(unique = true, nullable = false) // Added unique constraint for email
    private String email;

    @Column(nullable = false)
    private String password;

    private String description;

    private String profilePictureUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "user_follows",
            joinColumns = @JoinColumn(name = "follower_id"),
            inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    @JsonIgnore
    private List<User> follows = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "user_followers",
            joinColumns = @JoinColumn(name = "following_id"), // The user who is being followed
            inverseJoinColumns = @JoinColumn(name = "follower_id")  // The user who is following
    )
    @JsonIgnore
    private List<User> followers = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "friend_requests_sent",
            joinColumns = @JoinColumn(name = "requester_id"),
            inverseJoinColumns = @JoinColumn(name = "recipient_id")
    )
    @JsonIgnore
    private List<User> requested = new ArrayList<>();

    @ManyToMany(mappedBy = "requested")
    @JsonIgnore
    private List<User> requests = new ArrayList<>();

    public LocalDateTime getLastReactionCheckTimestamp() {
		return lastReactionCheckTimestamp;
	}

	public void setLastReactionCheckTimestamp(LocalDateTime lastReactionCheckTimestamp) {
		this.lastReactionCheckTimestamp = lastReactionCheckTimestamp;
	}

	@Column(name = "last_reaction_check_timestamp", nullable = false)
    private LocalDateTime lastReactionCheckTimestamp = LocalDateTime.now();
    // Getters and setters...

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    public List<User> getFollows() {
        return follows;
    }

    public void setFollows(List<User> follows) {
        this.follows = follows;
    }

    public List<User> getFollowers() {
        return followers;
    }

    public void setFollowers(List<User> followers) {
        this.followers = followers;
    }

    public List<User> getRequested() {
        return requested;
    }

    public void setRequested(List<User> requested) {
        this.requested = requested;
    }

    public List<User> getRequests() {
        return requests;
    }

    public void setRequests(List<User> requests) {
        this.requests = requests;
    }
}