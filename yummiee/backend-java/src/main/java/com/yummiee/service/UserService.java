package com.yummiee.service;

import com.yummiee.model.User;
import com.yummiee.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Long getOrCreateUserId(HttpServletRequest request) {
        String clerkUserId = request.getHeader("x-clerk-user-id");
        if (clerkUserId == null || clerkUserId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A signed-in user is required");
        }

        final String finalClerkUserId = clerkUserId;
        User user = userRepository.findByClerkUserId(finalClerkUserId)
                .orElseGet(() -> userRepository.save(User.builder()
                        .clerkUserId(finalClerkUserId)
                        .email(finalClerkUserId + "@yummiee.com")
                        .firstName("User")
                        .lastName("")
                        .build()));

        return user.getId();
    }
}
