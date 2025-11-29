package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.PostDto;
import com.myProjects.mindWeave.entities.Post;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.PostRepository;
import com.myProjects.mindWeave.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StreakService streakService; // Inject StreakService

    private PostDto convertToDto(Post post) {
        PostDto dto = new PostDto();
        dto.setPostId(post.getPostId());
        dto.setContent(post.getContent());
        dto.setTimestamp(post.getTimestamp());
        dto.setUserId(post.getUser().getUserId());
        dto.setUsername(post.getUser().getUsername());
        dto.setFontStyle(post.getFontStyle());
        dto.setTextColor(post.getTextColor());
        dto.setBackgroundColor(post.getBackgroundColor());
        dto.setFontSize(post.getFontSize()); // Set the fontSize in the DTO
        return dto;
    }

    @Override
    @Transactional
    public PostDto createPost(Long userId, String content, String fontStyle, String textColor, String backgroundColor, Integer fontSize) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Post newPost = new Post();
            newPost.setContent(content);
            newPost.setTimestamp(LocalDateTime.now());
            newPost.setUser(user);
            newPost.setFontStyle(fontStyle);
            newPost.setTextColor(textColor);
            newPost.setBackgroundColor(backgroundColor);
            newPost.setFontSize(fontSize); // Set the fontSize in the entity
            Post savedPost = postRepository.save(newPost);
            user.getPosts().add(savedPost);
            userRepository.save(user);

            streakService.updateStreaksOnNewPost(user); // Call StreakService

            return convertToDto(savedPost);
        }
        return null;
    }

    @Override
    public PostDto getPostById(Long postId) {
        Optional<Post> postOptional = postRepository.findById(postId);
        return postOptional.map(this::convertToDto).orElse(null);
    }

    @Override
    public List<PostDto> getPostsByUser(Long userId) {
        List<Post> posts = postRepository.findByUser_UserId(userId);
        return posts.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }
    

    @Override // <--- ENSURE THIS IS PRESENT
    public boolean doesUserExist(Long userId) {
        return userRepository.existsById(userId);
    }
}