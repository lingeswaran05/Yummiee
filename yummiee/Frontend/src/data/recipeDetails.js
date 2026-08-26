export const recipeDetails = {
  1: {
    id: 1,
    name: "Creamy Garlic Pasta",
    description:
      "A rich and creamy garlic pasta that's quick, comforting, and perfect for a cozy dinner at home.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1400&q=85",

    category: "Dinner",
    time: 20,
    difficulty: "Easy",
    servings: 2,

    rating: 4.8,
    reviews: 124,

    ingredients: [
      {
        id: 1,
        name: "Pasta",
        quantity: 200,
        unit: "g",
      },
      {
        id: 2,
        name: "Garlic",
        quantity: 4,
        unit: "cloves",
      },
      {
        id: 3,
        name: "Butter",
        quantity: 2,
        unit: "tbsp",
      },
      {
        id: 4,
        name: "Heavy cream",
        quantity: 150,
        unit: "ml",
      },
      {
        id: 5,
        name: "Parmesan cheese",
        quantity: 50,
        unit: "g",
      },
      {
        id: 6,
        name: "Salt",
        quantity: 1,
        unit: "tsp",
      },
      {
        id: 7,
        name: "Black pepper",
        quantity: 0.5,
        unit: "tsp",
      },
      {
        id: 8,
        name: "Parsley",
        quantity: 2,
        unit: "tbsp",
      },
    ],

    instructions: [
      {
        step: 1,
        title: "Cook the pasta",
        description:
          "Bring a large pot of salted water to a boil. Cook the pasta until al dente according to the package instructions. Reserve a little pasta water before draining.",
      },
      {
        step: 2,
        title: "Prepare the garlic butter",
        description:
          "Melt the butter in a large pan over medium heat. Add finely minced garlic and cook for about one minute until fragrant.",
      },
      {
        step: 3,
        title: "Make the creamy sauce",
        description:
          "Pour in the heavy cream and gently simmer. Add parmesan cheese and stir continuously until the sauce becomes smooth and creamy.",
      },
      {
        step: 4,
        title: "Combine everything",
        description:
          "Add the cooked pasta to the sauce. Toss well so every strand is coated. Add a splash of reserved pasta water if the sauce is too thick.",
      },
      {
        step: 5,
        title: "Season and serve",
        description:
          "Season with salt and freshly ground black pepper. Finish with chopped parsley and extra parmesan before serving.",
      },
    ],

    nutrition: {
      calories: 520,
      protein: 18,
      carbs: 64,
      fat: 22,
    },

    notes:
      "For a lighter version, you can replace some of the heavy cream with milk. Add grilled chicken or mushrooms for extra protein.",
  },

  2: {
    id: 2,
    name: "Tomato Rice",
    description:
      "Simple, flavorful tomato rice made with aromatic spices and fresh tomatoes.",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1400&q=85",

    category: "Lunch",
    time: 30,
    difficulty: "Easy",
    servings: 4,

    rating: 4.7,
    reviews: 98,

    ingredients: [
      {
        id: 1,
        name: "Rice",
        quantity: 2,
        unit: "cups",
      },
      {
        id: 2,
        name: "Tomatoes",
        quantity: 3,
        unit: "medium",
      },
      {
        id: 3,
        name: "Onion",
        quantity: 1,
        unit: "medium",
      },
      {
        id: 4,
        name: "Green chilli",
        quantity: 2,
        unit: "pieces",
      },
      {
        id: 5,
        name: "Cooking oil",
        quantity: 2,
        unit: "tbsp",
      },
      {
        id: 6,
        name: "Salt",
        quantity: 1,
        unit: "tsp",
      },
    ],

    instructions: [
      {
        step: 1,
        title: "Cook the rice",
        description:
          "Wash and cook the rice until each grain is fluffy. Allow it to cool slightly.",
      },
      {
        step: 2,
        title: "Prepare the tomato base",
        description:
          "Heat oil in a pan. Add onions and green chillies and sauté until the onions become soft.",
      },
      {
        step: 3,
        title: "Add tomatoes",
        description:
          "Add chopped tomatoes and cook until they become soft and the mixture turns into a thick sauce.",
      },
      {
        step: 4,
        title: "Combine",
        description:
          "Add the cooked rice and gently mix everything together.",
      },
      {
        step: 5,
        title: "Serve",
        description:
          "Season with salt and serve hot with raita or your favorite side dish.",
      },
    ],

    nutrition: {
      calories: 340,
      protein: 7,
      carbs: 58,
      fat: 9,
    },

    notes:
      "You can add peas, carrots, capsicum, or leftover vegetables to make this more nutritious.",
  },

  3: {
    id: 3,
    name: "Vegetable Biryani",
    description:
      "Fragrant basmati rice layered with colorful vegetables, herbs, and aromatic biryani spices.",
    image:
      "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=1400&q=85",

    category: "Dinner",
    time: 40,
    difficulty: "Medium",
    servings: 4,

    rating: 4.9,
    reviews: 187,

    ingredients: [
      {
        id: 1,
        name: "Basmati rice",
        quantity: 2,
        unit: "cups",
      },
      {
        id: 2,
        name: "Mixed vegetables",
        quantity: 300,
        unit: "g",
      },
      {
        id: 3,
        name: "Onion",
        quantity: 2,
        unit: "medium",
      },
      {
        id: 4,
        name: "Biryani masala",
        quantity: 2,
        unit: "tbsp",
      },
      {
        id: 5,
        name: "Cooking oil",
        quantity: 3,
        unit: "tbsp",
      },
      {
        id: 6,
        name: "Mint leaves",
        quantity: 0.5,
        unit: "cup",
      },
    ],

    instructions: [
      {
        step: 1,
        title: "Prepare the rice",
        description:
          "Wash and soak the basmati rice for about 20 minutes. Drain before cooking.",
      },
      {
        step: 2,
        title: "Sauté the vegetables",
        description:
          "Heat oil and sauté sliced onions until golden. Add the mixed vegetables and cook for a few minutes.",
      },
      {
        step: 3,
        title: "Add spices",
        description:
          "Add biryani masala and mix well until the vegetables are coated with the spices.",
      },
      {
        step: 4,
        title: "Cook the biryani",
        description:
          "Add rice and enough water. Cover and cook until the rice is tender and fluffy.",
      },
      {
        step: 5,
        title: "Garnish",
        description:
          "Top with fresh mint leaves and serve hot with raita.",
      },
    ],

    nutrition: {
      calories: 410,
      protein: 9,
      carbs: 68,
      fat: 12,
    },

    notes:
      "For extra flavor, add fried onions, saffron milk, or roasted cashews before serving.",
  },
};