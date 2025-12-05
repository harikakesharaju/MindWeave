package com.myProjects.mindWeave.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myProjects.mindWeave.dto.PostDto;
import com.myProjects.mindWeave.dto.ReactionNotificationDto;
import com.myProjects.mindWeave.entities.Post;
import com.myProjects.mindWeave.entities.PostReaction;
//import com.myProjects.mindWeave.entities.ReactionType;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.PostReactionRepository;
import com.myProjects.mindWeave.repositories.PostRepository;
import com.myProjects.mindWeave.repositories.UserRepository;

@Service
public class PostServiceImpl implements PostService {

 @Autowired
private PostRepository postRepository;

 @Autowired
 private UserRepository userRepository;

 @Autowired
 private StreakService streakService; // Inject StreakService

 
 @Autowired
 private PostReactionRepository reactionRepository;
 
 // REMOVED: @Autowired private FileStorageService fileStorageService; 
    
    @Autowired // NEW: Inject the AI Image Generation Service
    private AiImageService aiImageService;

 // 1. Update convertToDto to include new fields
  
private PostDto convertToDto(Post post, Long loggedInUserId) {
    PostDto dto = new PostDto();

    dto.setPostId(post.getPostId());
    dto.setHeading(post.getHeading());
    dto.setImagePath(post.getImagePath());
    dto.setTimestamp(post.getTimestamp());
    dto.setContent(post.getContent());
    dto.setFontStyle(post.getFontStyle());
    dto.setTextColor(post.getTextColor());
    dto.setBackgroundColor(post.getBackgroundColor());
    dto.setUserId(post.getUser().getUserId());
    dto.setUsername(post.getUser().getUsername());
    dto.setBackgroundMode(post.getBackgroundMode());

    // ✅ counts based on booleans
    long likeCount = reactionRepository.countByPostAndLikedTrue(post);
    long dislikeCount = reactionRepository.countByPostAndDislikedTrue(post);
    dto.setLikeCount(likeCount);
    dto.setDislikeCount(dislikeCount);

    // ✅ logged-in user's reaction
    dto.setUserReaction(null); // default

    if (loggedInUserId != null) {
        userRepository.findById(loggedInUserId).ifPresent(loggedUser -> {
            reactionRepository.findByPostAndUser(post, loggedUser).ifPresent(userReact -> {
                if (userReact.isLiked() && userReact.isDisliked()) {
                    // if you ever allow both simultaneously
                    dto.setUserReaction("BOTH");
                } else if (userReact.isLiked()) {
                    dto.setUserReaction("LIKE");
                } else if (userReact.isDisliked()) {
                    dto.setUserReaction("DISLIKE");
                }
            });
        });
    }

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
            newPost.setBackgroundMode(backgroundMode);

   Post savedPost = postRepository.save(newPost);
            
            // Update user's posts relationship
            user.getPosts().add(savedPost);
            userRepository.save(user);

            // Update streak
            streakService.updateStreaksOnNewPost(user);

   return convertToDto(savedPost,userId);
  }
  return null;
 }

 @Override
 public PostDto getPostById(Long postId, Long loggedUserId) {
  Optional<Post> postOptional = postRepository.findById(postId);
  return postOptional.map(post -> convertToDto(post, loggedUserId))
          .orElse(null);
  }

 @Override
 public List<PostDto> getPostsByUser(Long userId, Long loggedUserId) {
     List<Post> posts = postRepository.findByUser_UserId(userId);
     return posts.stream()
             .map(post -> convertToDto(post, loggedUserId))
             .collect(Collectors.toList());
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
 
 @Override
 @Transactional
 public void reactToPost(Long postId, Long userId, String type) {
     Post post = postRepository.findById(postId)
             .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
     User user = userRepository.findById(userId)
             .orElseThrow(() -> new RuntimeException("User not found: " + userId));

     PostReaction reaction = reactionRepository
             .findByPostAndUser(post, user)
             .orElseGet(() -> {
                 PostReaction r = new PostReaction();
                 r.setPost(post);
                 r.setUser(user);
                 r.setLiked(false);
                 r.setDisliked(false);
                 return r;
             });

     String t = type.toUpperCase();

     switch (t) {
         case "LIKE":
             // ✅ independent: toggle LIKE only
             reaction.setLiked(!reaction.isLiked());
             break;
         case "DISLIKE":
             // ✅ independent: toggle DISLIKE only
             reaction.setDisliked(!reaction.isDisliked());
             break;
         default:
             throw new IllegalArgumentException("Invalid reaction type: " + type);
     }

     // Optional behavior:
     // - If both booleans are false and reaction existed → delete
     // - Else save / create

     if (!reaction.isLiked() && !reaction.isDisliked() && reaction.getReactionId() != null) {
         // nothing selected anymore → delete row
         reactionRepository.delete(reaction);
     } else {
         reactionRepository.save(reaction);
     }
 }


 @Override
 @Transactional
 public void removeReaction(Long postId, Long userId) {
     Post post = postRepository.findById(postId)
             .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
     User user = userRepository.findById(userId)
             .orElseThrow(() -> new RuntimeException("User not found: " + userId));

     reactionRepository.findByPostAndUser(post, user)
             .ifPresent(reactionRepository::delete);
 }
 
//🆕 1. Implementation for Unread Count
 @Override
 public Long getUnreadReactionCount(Long loggedInUserId) {
     // Uses the new custom query defined in the repository
     return reactionRepository.countUnreadReactionsForUser(loggedInUserId);
 }

 // 🆕 2. Implementation for Marking Reactions as Read
 @Override
 @Transactional
 public void updateLastReactionCheckTimestamp(Long loggedInUserId) {
     userRepository.findById(loggedInUserId).ifPresent(user -> {
         // Set the user's last check time to the current time
         user.setLastReactionCheckTimestamp(LocalDateTime.now());
         userRepository.save(user);
     });
 }
 
 @Override
 public List<ReactionNotificationDto> getUnreadReactionDetails(Long loggedInUserId) {
     List<PostReaction> unreadReactions = reactionRepository.findUnreadReactionsForUser(loggedInUserId);

     return unreadReactions.stream()
         .map(reaction -> {
             String type =null;
             Boolean liked=reaction.isLiked();
             Boolean disliked=reaction.isDisliked();
             if (liked && disliked) {
                 // 🆕 Handle the "BOTH" case explicitly
                 type = "BOTH"; 
             } else if (liked) {
                 type = "LIKE";
             } else if (disliked) {
                 type = "DISLIKE";
             }
             if (type == null) return null; // Should not happen based on the query, but safe check

             return new ReactionNotificationDto(
                 reaction.getPost().getPostId(),
                 reaction.getPost().getHeading(),
                 reaction.getUser().getUserId(),
                 reaction.getUser().getUsername(),
                 type,
                 reaction.getTimestamp()
             );
         })
         .filter(dto -> dto != null)
         .collect(Collectors.toList());
 }


}