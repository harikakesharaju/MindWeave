package com.myProjects.mindWeave.dto;

import lombok.Data;
import java.time.LocalDateTime;

//@Data
public class PostDto {
    private Long postId;
    private String content;
    private LocalDateTime timestamp;
    private Long userId; // To identify the creator
    private String username; // Optionally include the username of the creator
    private Long likeCount;
    private Long dislikeCount;
    private String userReaction;
    
    
    public Long getLikeCount() {
		return likeCount;
	}



	public void setLikeCount(Long likeCount) {
		this.likeCount = likeCount;
	}



	public Long getDislikeCount() {
		return dislikeCount;
	}



	public void setDislikeCount(Long dislikeCount) {
		this.dislikeCount = dislikeCount;
	}



	public String getUserReaction() {
		return userReaction;
	}



	public void setUserReaction(String userReaction) {
		this.userReaction = userReaction;
	}



	public String getBackgroundMode() {
		return backgroundMode;
	}

    
    
	public void setBackgroundMode(String backgroundMode) {
		this.backgroundMode = backgroundMode;
	}

	private String fontStyle;
    private String textColor;
    private String backgroundColor;
    private String heading;
    private String imagePath; // The S3 key/path
    private String backgroundMode; // "light" or "dark"
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