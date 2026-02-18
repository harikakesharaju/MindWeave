package com.myProjects.mindWeave.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.myProjects.mindWeave.dto.LoginRequest;
import com.myProjects.mindWeave.dto.UserDto;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(
    	    value = "/register",
    	    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    	)
    	public ResponseEntity<UserDto> registerUser(
    	        @RequestPart("user") User newUser,
    	        @RequestPart("image") MultipartFile image
    	) {
    	    UserDto createdUser = userService.createUser(newUser, image);
    	    return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    	}

    @PostMapping("/login")
    public ResponseEntity<UserDto> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<UserDto> userDtoOptional = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        return userDtoOptional.map(userDto -> new ResponseEntity<>(userDto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.UNAUTHORIZED));
    }
    
    @PostMapping(
    	    value = "/{userId}/profile-image",
    	    consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    	)
    	public ResponseEntity<Void> uploadProfileImage(
    	        @PathVariable Long userId,
    	        @RequestPart("image") MultipartFile image
    	) {
    	    userService.updateProfileImage(userId, image);
    	    return ResponseEntity.ok().build();
    	}

    @GetMapping("/{userId}/profile-image")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Long userId) {

        byte[] image = userService.getProfileImage(userId);
        String contentType = userService.getProfileImageType(userId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(image);
    }



    @PostMapping("/friend-request/send")
    public ResponseEntity<String> sendFriendRequest(@RequestParam Long senderId, @RequestParam Long receiverId) {
        userService.sendFriendRequest(senderId, receiverId);
        return ResponseEntity.ok("Friend request sent.");
    }

    @PostMapping("/friend-request/accept")
    public ResponseEntity<String> acceptFriendRequest(@RequestParam Long receiverId, @RequestParam Long senderId) {
        userService.acceptFriendRequest(receiverId, senderId);
        return ResponseEntity.ok("Friend request accepted.");
    }

    // NEW ENDPOINT
    @GetMapping("/{userId}/friend-requests/pending")
    public ResponseEntity<List<UserDto>> getPendingFriendRequests(@PathVariable Long userId) {
        List<UserDto> pendingRequests = userService.getPendingFriendRequests(userId);
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<UserDto>> getFollowers(@PathVariable Long userId) {
        List<UserDto> followers = userService.getFollowers(userId);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserDto>> getFollowing(@PathVariable Long userId) {
        List<UserDto> following = userService.getFollowing(userId);
        return ResponseEntity.ok(following);
    }
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId, @RequestHeader(value = "loggedInUserId", required = false) Long loggedInUserId) {
        Optional<UserDto> userDto = userService.getUserDtoById(userId, loggedInUserId);
        return userDto.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        Optional<UserDto> userDto = userService.getUserByUsername(username);
        return userDto.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/email/{email}") // New endpoint
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        Optional<UserDto> userDto = userService.getUserByEmail(email);
        return userDto.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
        List<UserDto> recommendations = userService.searchUsersByEmailOrUsername(query);
        if (!recommendations.isEmpty()) {
            return new ResponseEntity<>(recommendations, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Or HttpStatus.OK with an empty list
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long userId, @RequestBody UserDto updatedUserDto) {
        Optional<UserDto> updatedDto = userService.updateUser(userId, updatedUserDto);
        return updatedDto.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                               .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/friend-request/check")
    public ResponseEntity<Map<String, Boolean>> checkFriendRequest(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        boolean exists = userService.checkIfFriendRequestSent(senderId, receiverId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}