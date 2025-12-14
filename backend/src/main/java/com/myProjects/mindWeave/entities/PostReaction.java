package com.myProjects.mindWeave.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "post_reactions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"})
)
public class PostReaction {
   public PostReaction() {}
    public PostReaction(Long reactionId, Post post, User user, boolean liked, boolean disliked) {
		super();
		this.reactionId = reactionId;
		this.post = post;
		this.user = user;
		this.liked = liked;
		this.disliked = disliked;
	}
    
    public boolean hasNoReaction() {
        return !liked && !disliked;
    }


	public Long getReactionId() {
		return reactionId;
	}

	public void setReactionId(Long reactionId) {
		this.reactionId = reactionId;
	}

	public Post getPost() {
		return post;
	}

	public void setPost(Post post) {
		this.post = post;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public boolean isLiked() {
		return liked;
	}

	public void setLiked(boolean liked) {
		this.liked = liked;
	}

	public boolean isDisliked() {
		return disliked;
	}

	public void setDisliked(boolean disliked) {
		this.disliked = disliked;
	}

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private boolean liked = false;

    @Column(nullable = false)
    private boolean disliked = false;
    
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

	public LocalDateTime getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
}
