package com.myProjects.mindWeave.services;

import java.util.List;

import com.myProjects.mindWeave.dto.PostDto;
import com.myProjects.mindWeave.dto.ReactionNotificationDto;


public interface PostService {
    PostDto createPost( Long userId,
    		String heading,
    		String imagePath, // This parameter is now ignored/redundant, but kept to match interface
    		String content,
    		String fontStyle,
    		String textColor,
    		String backgroundColor,
    		String backgroundMode);
    PostDto getPostById(Long postId, Long loggedUserId);
    List<PostDto> getPostsByUser(Long userId, Long loggedUserId);
    void deletePost(Long postId);
    boolean doesUserExist(Long userId); 
    
    void reactToPost(Long postId, Long userId, String type);
    void removeReaction(Long postId, Long userId);
    
    Long getUnreadReactionCount(Long loggedInUserId);

    void updateLastReactionCheckTimestamp(Long loggedInUserId);
    
    List<ReactionNotificationDto> getUnreadReactionDetails(Long loggedInUserId);


}