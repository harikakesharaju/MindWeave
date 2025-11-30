package com.myProjects.mindWeave.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; // Corrected import for JSON body
import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestPart; // Removed
// import org.springframework.web.multipart.MultipartFile; // Removed
import org.springframework.web.bind.annotation.RestController;

import com.myProjects.mindWeave.dto.CreatePostDto;
import com.myProjects.mindWeave.dto.PostDto;
// import com.myProjects.mindWeave.services.FileStorageService; // Removed
import com.myProjects.mindWeave.services.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    
    // Removed injection of FileStorageService, as it is no longer used for creation
    // @Autowired private FileStorageService fileStorageService;

    // --- UPDATED CREATE POST ENDPOINT ---
    // 1. Removed 'consumes = MediaType.MULTIPART_FORM_DATA_VALUE'
    // 2. Changed @RequestPart/@RequestPart to a single @RequestBody
    // 3. Removed all imagePath and file handling logic
    @PostMapping("/create/{userId}")
    public ResponseEntity<PostDto> createPost(
            @PathVariable Long userId,
            @RequestBody @Valid CreatePostDto request) { // Accepts simple JSON body
            
            // File handling logic (including imagePath definition) removed.
            
            // Note: The createPost service method is called with 'null' for imagePath, 
            // as the service implementation now handles AI generation internally.
            PostDto createdPost = postService.createPost(
            		userId,
               request.getHeading(),
                null, // The service layer will ignore this and generate the image internally
                request.getContent(),
                request.getFontStyle(),
                request.getTextColor(),
                request.getBackgroundColor(),
                request.getFontSize(),
                request.getBackgroundMode());
            
            if (createdPost != null) {
                return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
            }
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long postId) {
        PostDto postDto = postService.getPostById(postId);
        if (postDto != null) {
            return new ResponseEntity<>(postDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getPostsByUser(@PathVariable Long userId) {
        List<PostDto> posts = postService.getPostsByUser(userId);
        if (!posts.isEmpty() || postService.doesUserExist(userId)) { // Check if user exists even if no posts
            return new ResponseEntity<>(posts, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // New DELETE endpoint
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        try {
            postService.deletePost(postId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content for successful deletion
        } catch (Exception e) {
            // Log the exception, perhaps return a more specific error if needed
            System.err.println("Error deleting post: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}