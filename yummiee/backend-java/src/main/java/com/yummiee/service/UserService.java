package com.yummiee.service;

import com.yummiee.model.User;
import com.yummiee.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Long getOrCreateUserId(HttpServletRequest request) {
        String clerkUserId = request.getHeader("x-clerk-user-id");
        if (clerkUserId == null || clerkUserId.trim().isEmpty()) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                clerkUserId = authHeader.substring(7);
            }
        }
        if (clerkUserId == null || clerkUserId.trim().isEmpty()) {
            clerkUserId = "mock_clerk_user_1";
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
