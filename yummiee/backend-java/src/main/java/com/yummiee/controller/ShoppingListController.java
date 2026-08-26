package com.yummiee.controller;

import com.yummiee.dto.ShoppingListItemDTO;
import com.yummiee.service.ShoppingListService;
import com.yummiee.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/shopping-list")
public class ShoppingListController {

    @Autowired
    private ShoppingListService shoppingListService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<ShoppingListItemDTO>> getShoppingList(HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        List<ShoppingListItemDTO> list = shoppingListService.getUserShoppingList(userId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<ShoppingListItemDTO> addItem(@RequestBody ShoppingListItemDTO dto, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        ShoppingListItemDTO created = shoppingListService.addItem(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody ShoppingListItemDTO dto, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        return shoppingListService.updateItem(userId, id, dto)
                .<ResponseEntity<?>>map(item -> ResponseEntity.ok(Collections.singletonMap("message", "Shopping list item updated")))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        boolean deleted = shoppingListService.deleteItem(userId, id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> clearList(HttpServletRequest request) {
        Long userId = userService.getOrCreateUserId(request);
        shoppingListService.clearList(userId);
        return ResponseEntity.noContent().build();
    }
}
