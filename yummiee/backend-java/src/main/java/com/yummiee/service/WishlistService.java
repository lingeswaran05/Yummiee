package com.yummiee.service;

import com.yummiee.dto.RecipeDTO;
import com.yummiee.model.Wishlist;
import com.yummiee.repository.RecipeRepository;
import com.yummiee.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeService recipeService;

    @Transactional(readOnly = true)
    public List<RecipeDTO> getUserWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        return wishlistItems.stream()
                .map(item -> recipeRepository.findById(item.getRecipeId()).orElse(null))
                .filter(Objects::nonNull)
                .map(recipeService::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(Long userId, Long recipeId) {
        if (wishlistRepository.findByUserIdAndRecipeId(userId, recipeId).isEmpty()) {
            Wishlist item = Wishlist.builder()
                    .userId(userId)
                    .recipeId(recipeId)
                    .build();
            wishlistRepository.save(item);
        }
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long recipeId) {
        wishlistRepository.deleteByUserIdAndRecipeId(userId, recipeId);
    }
}
