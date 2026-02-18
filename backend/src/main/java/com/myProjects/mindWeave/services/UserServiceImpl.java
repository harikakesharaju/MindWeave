package com.myProjects.mindWeave.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.myProjects.mindWeave.dto.UserDto;
import com.myProjects.mindWeave.entities.User;
import com.myProjects.mindWeave.repositories.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" +
                    "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setDescription(user.getDescription());
        dto.setHasProfileImage(user.getProfileImage() != null);
        dto.setProfilePictureUrl("/api/users/" + user.getUserId() + "/profile-image");
        if (user.getFollows() != null) {
            dto.setFollows(user.getFollows().stream().map(User::getUserId).collect(Collectors.toList()));
        }
        if (user.getFollowers() != null) {
            dto.setFollowers(user.getFollowers().stream().map(User::getUserId).collect(Collectors.toList()));
        }
        return dto;
    }

    @Transactional
    @Override
    public void updateProfileImage(Long userId, MultipartFile image) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            user.setProfileImage(image.getBytes());
            user.setProfileImageType(image.getContentType()); // IMPORTANT
            userRepository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile image", e);
        }
    }

    @Override
    public String getProfileImageType(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getProfileImageType();
    }

    
    @Override
    public byte[] getProfileImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getProfileImage();
    }


    
    @Override
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id).map(this::convertToDto);
    }

    @Override
    public Optional<UserDto> getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(this::convertToDto);
    }

    @Override
    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email).map(this::convertToDto);
    }

    @Override
    public Optional<UserDto> authenticateUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(password)) {
                return Optional.of(convertToDto(user));
            }
        }
        return Optional.empty();
    }

    @Override
    public Optional<UserDto> getUserDtoById(Long userId, Long loggedInUserId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            UserDto dto = convertToDto(user);
            if (loggedInUserId != null && !loggedInUserId.equals(userId)) {
                Optional<User> loggedInUserOptional = userRepository.findById(loggedInUserId);
                if (loggedInUserOptional.isPresent()) {
                    User loggedInUser = loggedInUserOptional.get();
                    dto.setHasSentRequestTo(loggedInUser.getRequested().contains(user));
                    // Check if the viewed user has sent a request to the logged-in user
                    dto.setHasSentRequestToMe(user.getRequested().contains(loggedInUser));
                }
            }
            return Optional.of(dto);
        }
        return Optional.empty();
    }

    @Override
    public Optional<UserDto> getUserDtoById(Long userId) {
        // Overload the existing method to call the new one with loggedInUserId as null
        return getUserDtoById(userId, null);
    }

    @Override
    public UserDto createUser(User user,MultipartFile image) {
        // Check for existing username and email
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Manual data validation
        if (!StringUtils.hasText(user.getEmail())) {
            throw new RuntimeException("Email cannot be blank");
        }
        if (!EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            throw new RuntimeException("Invalid email format");
        }
        if (!StringUtils.hasText(user.getPassword())) {
            throw new RuntimeException("Password cannot be blank");
        }
        if (user.getPassword().length() < 3) {
            throw new RuntimeException("Password must be at least 3 characters long");
        }
        if (!StringUtils.hasText(user.getUsername())) {
            throw new RuntimeException("Username cannot be blank");
        }
        
        try {
            user.setProfileImage(image.getBytes());
            user.setProfileImageType(image.getContentType());
        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile image");
        }


        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Override
    @Transactional
    public void sendFriendRequest(Long senderId, Long receiverId) {
        Optional<User> senderOptional = userRepository.findById(senderId);
        Optional<User> receiverOptional = userRepository.findById(receiverId);

        if (senderOptional.isPresent() && receiverOptional.isPresent()) {
            User sender = senderOptional.get();
            User receiver = receiverOptional.get();
            if (!sender.getRequested().contains(receiver) && !receiver.getRequests().contains(sender) && !sender.getFollows().contains(receiver)) {
                sender.getRequested().add(receiver);
                receiver.getRequests().add(sender);
                userRepository.save(sender);
                userRepository.save(receiver);
            }
        }
    }

    @Override
    @Transactional
    public void acceptFriendRequest(Long receiverId, Long senderId) {
        Optional<User> receiverOptional = userRepository.findById(receiverId);
        Optional<User> senderOptional = userRepository.findById(senderId);

        if (receiverOptional.isPresent() && senderOptional.isPresent()) {
            User receiver = receiverOptional.get();
            User sender = senderOptional.get();
            if (receiver.getRequests().contains(sender)) {
                receiver.getRequests().remove(sender);
                sender.getRequested().remove(receiver);
                sender.getFollows().add(receiver);
                receiver.getFollowers().add(sender);
                userRepository.save(receiver);
                userRepository.save(sender);
            }
        }
    }

    @Override
    public List<UserDto> getFollowers(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        return userOptional.map(user -> user.getFollowers().stream().map(this::convertToDto).collect(Collectors.toList())).orElse(List.of());
    }

    @Override
    public List<UserDto> getFollowing(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        return userOptional.map(user -> user.getFollows().stream().map(this::convertToDto).collect(Collectors.toList())).orElse(List.of());
    }

    @Override
    public List<UserDto> searchUsersByEmailOrUsername(String query) {
        List<User> users = userRepository.findByEmailContainingIgnoreCase(query);
        List<User> usersByUsername = userRepository.findByUsernameContainingIgnoreCase(query);

        // Combine and remove duplicates
        List<User> allResults = new ArrayList<>(users);
        for (User user : usersByUsername) {
            if (!allResults.contains(user)) {
                allResults.add(user);
            }
        }
        return allResults.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public Optional<UserDto> updateUser(Long id, UserDto updatedUserDto) {
        Optional<User> existingUserOptional = userRepository.findById(id);
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();

            if (updatedUserDto.getUsername() != null) {
                existingUser.setUsername(updatedUserDto.getUsername());
            }

            if (updatedUserDto.getEmail() != null) {
                existingUser.setEmail(updatedUserDto.getEmail());
            }

            if (updatedUserDto.getDescription() != null) {
                existingUser.setDescription(updatedUserDto.getDescription());
            }

            // DO NOT update profile image here anymore

            User updatedUser = userRepository.save(existingUser);
            return Optional.of(convertToDto(updatedUser));
        }
        return Optional.empty();
    }

    
    @Override
    public boolean checkIfFriendRequestSent(Long senderId, Long receiverId) {
        Optional<User> senderOptional = userRepository.findById(senderId);
        Optional<User> receiverOptional = userRepository.findById(receiverId);

        if (senderOptional.isPresent() && receiverOptional.isPresent()) {
            User sender = senderOptional.get();
            return sender.getRequested().contains(receiverOptional.get());
        }
        return false;
    }
    
    @Override
    public List<UserDto> getPendingFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Assuming convertToDto(User user) returns UserDto directly
        return user.getRequests().stream()
                .map(requester -> convertToDto(requester)) // Or convertToUserDto(requester, userId)
                .collect(Collectors.toList());
    }

}