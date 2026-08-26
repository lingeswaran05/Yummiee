import {
  ArrowLeft,
  Check,
  Circle,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { useShoppingList } from "../context/ShoppingListContext";

function ShoppingList() {
  const {
    shoppingList,
    toggleItem,
    removeItem,
    clearList,
  } = useShoppingList();

  const completedItems = shoppingList.filter(
    (item) => item.checked
  ).length;

  const totalItems = shoppingList.length;

  const progress =
    totalItems === 0
      ? 0
      : Math.round(
          (completedItems / totalItems) * 100
        );

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1000px] px-5 py-8 md:px-10 md:py-12">

        {/* Back Button */}
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to recipes
        </Link>

        {/* Header */}
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <ShoppingCart className="h-7 w-7 text-primary" />

              <h1 className="text-3xl font-bold tracking-tight">
                Shopping List
              </h1>

            </div>

            <p className="mt-2 text-text-secondary">
              Check off ingredients as you shop.
            </p>

          </div>

          {/* Clear List */}
          {totalItems > 0 && (
            <button
              type="button"
              onClick={clearList}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />

              Clear List
            </button>
          )}

        </section>

        {/* Empty State */}
        {totalItems === 0 ? (

          <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-sm">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">

              <ShoppingCart className="h-8 w-8 text-primary" />

            </div>

            <h2 className="text-xl font-semibold">
              Your shopping list is empty
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Open a recipe, select the ingredients you need,
              and add them to your shopping list.
            </p>

            <Link
              to="/dashboard"
              className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark"
            >
              Browse Recipes
            </Link>

          </div>

        ) : (

          <>
            {/* Progress Card */}
            <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-text-secondary">
                    Shopping Progress
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {progress}%
                  </p>

                </div>

                <div className="text-right">

                  <p className="font-semibold">
                    {completedItems} / {totalItems}
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    items picked up
                  </p>

                </div>

              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f0eded]">

                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </section>

            {/* Items */}
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

              <div className="border-b border-[#f0eded] px-5 py-4">

                <h2 className="font-bold">
                  Items to Buy
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                  Tap an item when you've picked it up.
                </p>

              </div>

              <div className="divide-y divide-[#f0eded]">

                {shoppingList.map((item) => (

                  <div
                    key={item.id}
                    className={`flex items-center gap-4 px-5 py-5 transition ${
                      item.checked
                        ? "bg-[#fafafa]"
                        : "hover:bg-[#fffaf8]"
                    }`}
                  >

                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleItem(item.id)
                      }
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                        item.checked
                          ? "bg-secondary text-white"
                          : "border-2 border-[#d7d2d0]"
                      }`}
                      aria-label={
                        item.checked
                          ? `Uncheck ${item.name}`
                          : `Check ${item.name}`
                      }
                    >

                      {item.checked && (
                        <Check className="h-4 w-4" />
                      )}

                    </button>

                    {/* Item Information */}
                    <div className="min-w-0 flex-1">

                      <p
                        className={`font-semibold ${
                          item.checked
                            ? "text-text-secondary line-through"
                            : "text-text-primary"
                        }`}
                      >
                        {item.name}
                      </p>

                      {item.recipeName && (
                        <p className="mt-1 text-xs text-text-secondary">
                          From {item.recipeName}
                        </p>
                      )}

                    </div>

                    {/* Quantity */}
                    <span
                      className={`shrink-0 font-bold ${
                        item.checked
                          ? "text-text-secondary"
                          : "text-primary"
                      }`}
                    >
                      {Number.isInteger(item.quantity)
                        ? item.quantity
                        : item.quantity.toFixed(1)}{" "}
                      {item.unit}
                    </span>

                    {/* Remove Item */}
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="shrink-0 rounded-lg p-2 text-text-secondary transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>

                ))}

              </div>

            </section>

            {/* Completed Message */}
            {completedItems === totalItems && (
              <div className="mt-6 rounded-2xl bg-secondary/10 p-6 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white">

                  <Check className="h-6 w-6" />

                </div>

                <h2 className="mt-4 text-xl font-bold">
                  Shopping complete! 🎉
                </h2>

                <p className="mt-2 text-sm text-text-secondary">
                  You've picked up everything on your list.
                </p>

                <button
                  type="button"
                  onClick={clearList}
                  className="mt-5 rounded-xl bg-secondary px-5 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Clear List
                </button>

              </div>
            )}

          </>
        )}

      </main>
    </MainLayout>
  );
}

export default ShoppingList;