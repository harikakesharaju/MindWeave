package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.PostDto;

import java.util.List;

public interface PostService {
    PostDto createPost( Long userId,
    		String heading,
    		String imagePath, // This parameter is now ignored/redundant, but kept to match interface
    		String content,
    		String fontStyle,
    		String textColor,
    		String backgroundColor,
    		Integer fontSize,
    		String backgroundMode);
    PostDto getPostById(Long postId);
    List<PostDto> getPostsByUser(Long userId);
    void deletePost(Long postId);
    boolean doesUserExist(Long userId); 
}