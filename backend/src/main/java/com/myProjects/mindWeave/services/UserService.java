package com.myProjects.mindWeave.services;

import com.myProjects.mindWeave.dto.UserDto;
import com.myProjects.mindWeave.entities.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {
    Optional<UserDto> getUserById(Long id); // Changed return type to Optional<UserDto>
    User createUser(User user);
    void sendFriendRequest(Long senderId, Long receiverId);
    void acceptFriendRequest(Long receiverId, Long senderId);
    List<UserDto> getFollowers(Long userId);
    List<UserDto> getFollowing(Long userId);
    Optional<UserDto> getUserDtoById(Long userId);
	Optional<UserDto> getUserByUsername(String username);
	Optional<UserDto> getUserByEmail(String email); 
    Optional<UserDto> authenticateUser(String email, String password);
	List<UserDto> searchUsersByEmailOrUsername(String query);
	Optional<UserDto> updateUser(Long id, UserDto updatedUserDto);
	Optional<UserDto> getUserDtoById(Long userId, Long loggedInUserId);
	boolean checkIfFriendRequestSent(Long senderId, Long receiverId);
	 List<UserDto> getPendingFriendRequests(Long userId);
}