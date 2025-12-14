package com.myProjects.mindWeave.entities;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts")
public class Post {

	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long postId;

	    @Column(nullable = false, columnDefinition = "TEXT")
	    private String content;

	    private LocalDateTime timestamp;

	    @ManyToOne
	    @JsonIgnore
	    @JoinColumn(name = "user_id", nullable = false)
	    private User user;

	    private String fontStyle;
	    public String getBackgroundMode() {
			return backgroundMode;
		}

		public void setBackgroundMode(String backgroundMode) {
			this.backgroundMode = backgroundMode;
		}

		private String textColor;
	    private String backgroundColor;
	    private Integer fontSize; // Add this field
	    private String heading;
	    private String backgroundMode; // "light" or "dark"
	    
	    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
	    @JsonIgnore
	    private List<PostReaction> reactions;
 
	    public List<PostReaction> getReactions() {
			return reactions;
		}

		public void setReactions(List<PostReaction> reactions) {
			this.reactions = reactions;
		}

		public String getHeading() {
			return heading;
		}

		public void setHeading(String heading) {
			this.heading = heading;
		}

		public String getImagePath() {
			return imagePath;
		}

		public void setImagePath(String imagePath) {
			this.imagePath = imagePath;
		}

		private String imagePath;
	    
	    @PrePersist
	    protected void onCreate() {
	        timestamp = LocalDateTime.now();
	    }

	    // Getters and setters (ensure you have these for fontSize)
	    public Integer getFontSize() {
	        return fontSize;
	    }

	    public void setFontSize(Integer fontSize) {
	        this.fontSize = fontSize;
	    }

    // Getters and setters
    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFontStyle() {
        return fontStyle;
    }

    public void setFontStyle(String fontStyle) {
        this.fontStyle = fontStyle;
    }

    public String getTextColor() {
        return textColor;
    }

    public void setTextColor(String textColor) {
        this.textColor = textColor;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
}