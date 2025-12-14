package com.myProjects.mindWeave.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; // Corrected import for JSON body
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestPart; // Removed
// import org.springframework.web.multipart.MultipartFile; // Removed
import org.springframework.web.bind.annotation.RestController;

import com.myProjects.mindWeave.dto.CreatePostDto;
import com.myProjects.mindWeave.dto.PostDto;
import com.myProjects.mindWeave.dto.ReactionNotificationDto;
import com.myProjects.mindWeave.dto.UserDto;
// import com.myProjects.mindWeave.services.FileStorageService; // Removed
import com.myProjects.mindWeave.services.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/create/{userId}")
    public ResponseEntity<PostDto> createPost(
            @PathVariable Long userId,
            @RequestBody @Valid CreatePostDto request) {

        PostDto createdPost = postService.createPost(
                userId,
                request.getHeading(),
                null,
                request.getContent(),
                request.getFontStyle(),
                request.getTextColor(),
                request.getBackgroundColor(),
                request.getBackgroundMode());

        if (createdPost != null) {
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPostById(
            @RequestHeader(value="loggedInUserId", required = false) Long loggedUserId,
            @PathVariable Long postId) {

        PostDto postDto = postService.getPostById(postId, loggedUserId);
        if (postDto != null) {
            return new ResponseEntity<>(postDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getPostsByUser(
            @RequestHeader(value="loggedInUserId", required = false) Long loggedUserId,
            @PathVariable Long userId) {

        List<PostDto> posts = postService.getPostsByUser(userId, loggedUserId);

        if (!posts.isEmpty() || postService.doesUserExist(userId)) {
            return new ResponseEntity<>(posts, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        try {
            postService.deletePost(postId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            System.err.println("Error deleting post: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ REACTION ENDPOINTS USING String type

    @PostMapping("/{postId}/react/{userId}/{type}")
    public ResponseEntity<?> reactToPost(
            @PathVariable Long postId,
            @PathVariable Long userId,
            @PathVariable String type) {

        postService.reactToPost(postId, userId, type);
        return ResponseEntity.ok("Reaction updated");
    }

    @DeleteMapping("/{postId}/react/{userId}")
    public ResponseEntity<?> removeReaction(
            @PathVariable Long postId,
            @PathVariable Long userId) {

        postService.removeReaction(postId, userId);
        return ResponseEntity.ok("Reaction removed");
    }
    
    /**
     * Retrieves the count of reactions (likes/dislikes) on the logged-in user's
     * posts that they have not yet seen.
     * * @param loggedInUserId The ID of the user requesting the count (from header).
     * @return ResponseEntity<Long> The count of unread reactions.
     */
    @GetMapping("/reactions/unread/count")
    public ResponseEntity<Long> getUnreadReactionCount(
            @RequestHeader(value = "loggedInUserId") Long loggedInUserId) {
        
        if (loggedInUserId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        Long count = postService.getUnreadReactionCount(loggedInUserId);
        // Returns the count directly, even if zero.
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    /**
     * Updates the logged-in user's last reaction check timestamp to the current time,
     * effectively marking all current reactions on their posts as "read".
     * * @param loggedInUserId The ID of the user whose timestamp needs updating.
     * @return ResponseEntity<Void> No content on success.
     */
    @PostMapping("/reactions/mark-read")
    public ResponseEntity<Void> markReactionsAsRead(
            @RequestHeader(value = "loggedInUserId") Long loggedInUserId) {

        if (loggedInUserId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try {
            postService.updateLastReactionCheckTimestamp(loggedInUserId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (RuntimeException e) {
            // Handle cases where the user ID might not exist
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/reactions/unread/details")
    public ResponseEntity<List<ReactionNotificationDto>> getUnreadReactionDetails(
            @RequestHeader(value = "loggedInUserId") Long loggedInUserId) {

        if (loggedInUserId == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<ReactionNotificationDto> details = postService.getUnreadReactionDetails(loggedInUserId);
        return new ResponseEntity<>(details, HttpStatus.OK);
    }
    
    @GetMapping("/{postId}/reactions")
    public ResponseEntity<Map<String, List<UserDto>>> getPostReactions(
            @PathVariable Long postId) {

        try {
            Map<String, List<UserDto>> reactions = postService.getPostReactions(postId);
            return new ResponseEntity<>(reactions, HttpStatus.OK);

        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


}
