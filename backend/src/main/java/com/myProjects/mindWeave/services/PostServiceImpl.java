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

 // REMOVED: @Autowired private FileStorageService fileStorageService; 
    
    @Autowired // NEW: Inject the AI Image Generation Service
    private AiImageService aiImageService;

 // 1. Update convertToDto to include new fields
 private PostDto convertToDto(Post post) {
  PostDto dto = new PostDto();
  // ... existing setters ...
  dto.setPostId(post.getPostId());
  dto.setHeading(post.getHeading());   // <--- New
  dto.setImagePath(post.getImagePath());  // <--- New
  dto.setTimestamp(post.getTimestamp());
        dto.setContent(post.getContent());
        dto.setFontStyle(post.getFontStyle());
        dto.setTextColor(post.getTextColor());
        dto.setBackgroundColor(post.getBackgroundColor());
        dto.setFontSize(post.getFontSize());
        dto.setUserId(post.getUser().getUserId());
        dto.setUsername(post.getUser().getUsername());
        dto.setBackgroundMode(post.getBackgroundMode());
  return dto;
 }

 // 2. Update createPost signature and entity setting
 @Override
 @Transactional
 public PostDto createPost(
  Long userId, 
  String heading, 
  String imagePath, // This parameter is now ignored/redundant, but kept to match interface
  String content, 
  String fontStyle, 
  String textColor, 
  String backgroundColor,
  Integer fontSize,
String backgroundMode){
     
  Optional<User> userOptional = userRepository.findById(userId);
  if (userOptional.isPresent()) {
   User user = userOptional.get();
   
            // --- AI Image Generation Logic ---
            // Call the AI Service to generate the image URL based on content
            String generatedImagePath = aiImageService.generatePostImage(heading, content);
            // --- End AI Image Generation Logic ---
            
   Post newPost = new Post();
      
   newPost.setHeading(heading);   
   newPost.setImagePath(generatedImagePath); // <--- Set the AI-generated path
   newPost.setUser(user); // Ensure user is set
   newPost.setTimestamp(LocalDateTime.now());

   newPost.setContent(content);
            newPost.setFontStyle(fontStyle);
            newPost.setTextColor(textColor);
            newPost.setBackgroundColor(backgroundColor);
            newPost.setFontSize(fontSize);

   Post savedPost = postRepository.save(newPost);
            
            // Update user's posts relationship
            user.getPosts().add(savedPost);
            userRepository.save(user);

            // Update streak
            streakService.updateStreaksOnNewPost(user);

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
 @Transactional // Add @Transactional since we might manipulate related entities in future
 public void deletePost(Long postId) {
        Optional<Post> postOptional = postRepository.findById(postId);
        postOptional.ifPresent(post -> {
            // Remove post reference from the user's list before deleting the post
            User user = post.getUser();
            if (user != null) {
                user.getPosts().remove(post);
                userRepository.save(user);
            }
            postRepository.delete(post);
        });
 }
    

 @Override // <--- ENSURE THIS IS PRESENT
 public boolean doesUserExist(Long userId) {
  return userRepository.existsById(userId);
 }

}