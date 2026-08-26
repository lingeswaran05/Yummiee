package com.yummiee.repository;

import com.yummiee.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
    List<ShoppingListItem> findByUserIdOrderByIdDesc(Long userId);
    void deleteByUserId(Long userId);
}
