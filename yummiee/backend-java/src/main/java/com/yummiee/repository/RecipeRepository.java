package com.yummiee.repository;

import com.yummiee.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT r FROM Recipe r WHERE " +
           "(:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR :category = 'All' OR r.category = :category) AND " +
           "(:difficulty IS NULL OR r.difficulty = :difficulty)")
    List<Recipe> searchRecipes(@Param("search") String search,
                               @Param("category") String category,
                               @Param("difficulty") String difficulty);
    List<Recipe> findByUserIdOrderByIdDesc(Long userId);
}
