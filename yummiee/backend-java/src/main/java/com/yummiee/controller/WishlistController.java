package com.yummiee.controller;

import com.yummiee.dto.RecipeDTO;
import com.yummiee.service.UserService;
import com.yummiee.service.WishlistService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getWishlist(HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        List<RecipeDTO> wishlist = wishlistService.getUserWishlist(userId);
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{recipeId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long recipeId, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        wishlistService.addToWishlist(userId, recipeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Collections.singletonMap("message", "Added to wishlist"));
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long recipeId, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        wishlistService.removeFromWishlist(userId, recipeId);
        return ResponseEntity.noContent().build();
    }
}
