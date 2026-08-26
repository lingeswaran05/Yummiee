package com.yummiee.service;

import com.yummiee.dto.ShoppingListItemDTO;
import com.yummiee.model.Recipe;
import com.yummiee.model.ShoppingListItem;
import com.yummiee.repository.RecipeRepository;
import com.yummiee.repository.ShoppingListItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShoppingListService {

    @Autowired
    private ShoppingListItemRepository shoppingListItemRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    public List<ShoppingListItemDTO> getUserShoppingList(Long userId) {
        List<ShoppingListItem> items = shoppingListItemRepository.findByUserIdOrderByIdDesc(userId);
        return items.stream().map(item -> {
            String recipeName = "";
            if (item.getRecipeId() != null) {
                Optional<Recipe> recipeOpt = recipeRepository.findById(item.getRecipeId());
                if (recipeOpt.isPresent()) {
                    recipeName = recipeOpt.get().getName();
                }
            }
            return ShoppingListItemDTO.builder()
                    .id(item.getId())
                    .name(item.getName())
                    .quantity(item.getQuantity())
                    .unit(item.getUnit())
                    .checked(item.getChecked() != null ? item.getChecked() : false)
                    .recipeId(item.getRecipeId())
                    .recipeName(recipeName)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public ShoppingListItemDTO addItem(Long userId, ShoppingListItemDTO dto) {
        ShoppingListItem item = ShoppingListItem.builder()
                .userId(userId)
                .recipeId(dto.getRecipeId())
                .name(dto.getName())
                .quantity(dto.getQuantity() != null ? dto.getQuantity() : 1.0)
                .unit(dto.getUnit() != null ? dto.getUnit() : "unit")
                .checked(false)
                .build();

        ShoppingListItem saved = shoppingListItemRepository.save(item);
        return ShoppingListItemDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .quantity(saved.getQuantity())
                .unit(saved.getUnit())
                .checked(saved.getChecked())
                .recipeId(saved.getRecipeId())
                .build();
    }

    @Transactional
    public Optional<ShoppingListItemDTO> updateItem(Long userId, Long itemId, ShoppingListItemDTO dto) {
        return shoppingListItemRepository.findById(itemId)
                .filter(item -> item.getUserId().equals(userId))
                .map(item -> {
                    if (dto.getChecked() != null) item.setChecked(dto.getChecked());
                    if (dto.getQuantity() != null) item.setQuantity(dto.getQuantity());
                    if (dto.getName() != null) item.setName(dto.getName());
                    ShoppingListItem updated = shoppingListItemRepository.save(item);
                    return ShoppingListItemDTO.builder()
                            .id(updated.getId())
                            .name(updated.getName())
                            .quantity(updated.getQuantity())
                            .unit(updated.getUnit())
                            .checked(updated.getChecked())
                            .recipeId(updated.getRecipeId())
                            .build();
                });
    }

    @Transactional
    public boolean deleteItem(Long userId, Long itemId) {
        return shoppingListItemRepository.findById(itemId).map(item -> {
            if (item.getUserId().equals(userId)) {
                shoppingListItemRepository.delete(item);
                return true;
            }
            return false;
        }).orElse(false);
    }

    @Transactional
    public void clearList(Long userId) {
        shoppingListItemRepository.deleteByUserId(userId);
    }
}
