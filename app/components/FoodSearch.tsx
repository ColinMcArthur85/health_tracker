"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, X } from "lucide-react";

interface FoodItem {
  fdcId: string;
  name: string;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

interface SelectedFood extends FoodItem {
  quantity: number;
}

interface FoodSearchProps {
  onFoodsChange: (foods: SelectedFood[]) => void;
  initialFoods?: SelectedFood[];
}

export default function FoodSearch({ onFoodsChange, initialFoods = [] }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>(initialFoods);
  const [showResults, setShowResults] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const nextAllowedRef = useRef<number>(0);

  // Debounced + throttled search with request cancellation and Retry-After awareness
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Throttle if a retry-after window is active
      const now = Date.now();
      if (now < nextAllowedRef.current) {
        return; // skip firing until allowed
      }

      // Cancel previous in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setIsSearching(true);
      try {
        const response = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}`, { signal: abortRef.current.signal });
        const data = await response.json();
        if (response.status === 503 && data?.retryAfterMs) {
          // Respect server suggested backoff
          nextAllowedRef.current = Date.now() + Number(data.retryAfterMs);
        }
        if (Array.isArray(data.foods)) {
          setResults(data.foods);
          setShowResults(true);
        } else {
          setResults([]);
          setShowResults(false);
        }
      } catch (error) {
        console.error("Food search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const addFood = (food: FoodItem) => {
    const newFood: SelectedFood = { ...food, quantity: 1 };
    const updated = [...selectedFoods, newFood];
    setSelectedFoods(updated);
    onFoodsChange(updated);
    setQuery("");
    setShowResults(false);
  };

  const removeFood = (index: number) => {
    const updated = selectedFoods.filter((_, i) => i !== index);
    setSelectedFoods(updated);
    onFoodsChange(updated);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updated = selectedFoods.map((food, i) => (i === index ? { ...food, quantity: Math.max(0.1, quantity) } : food));
    setSelectedFoods(updated);
    onFoodsChange(updated);
  };

  // Calculate totals
  const totals = selectedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0) * food.quantity,
      protein: acc.protein + (food.protein || 0) * food.quantity,
      carbs: acc.carbs + (food.carbs || 0) * food.quantity,
      fat: acc.fat + (food.fat || 0) * food.quantity,
      fiber: acc.fiber + (food.fiber || 0) * food.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for food (e.g., chicken breast, apple, rice)..." className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-emerald-500"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-lg max-h-64 overflow-y-auto">
          {results.map((food) => (
            <button key={food.fdcId} onClick={() => addFood(food)} className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-white">{food.name}</p>
                  <p className="text-sm text-slate-400">
                    {food.servingSize} {food.servingUnit} • {food.calories || "?"} cal
                  </p>
                </div>
                <Plus size={20} className="text-emerald-400 flex-shrink-0 ml-2" />
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isSearching && <div className="text-center py-4 text-slate-500 text-sm">No foods found. Try a different search term.</div>}

      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-400">Selected Foods</h4>
          {selectedFoods.map((food, index) => (
            <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{food.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="text-xs text-slate-500">Servings:</label>
                    <input type="number" value={food.quantity} onChange={(e) => updateQuantity(index, parseFloat(e.target.value) || 1)} step="0.1" min="0.1" className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" />
                    <span className="text-xs text-slate-500">
                      × {food.servingSize}
                      {food.servingUnit}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    <span>{Math.round((food.calories || 0) * food.quantity)} cal</span>
                    <span>{Math.round((food.protein || 0) * food.quantity)}g protein</span>
                    <span>{Math.round((food.carbs || 0) * food.quantity)}g carbs</span>
                    <span>{Math.round((food.fat || 0) * food.quantity)}g fat</span>
                  </div>
                </div>
                <button onClick={() => removeFood(index)} className="p-1 hover:bg-slate-800 rounded transition-colors">
                  <X size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2">Total Nutrition</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <p className="text-xs text-slate-500">Calories</p>
                <p className="text-lg font-bold text-white">{Math.round(totals.calories)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Protein</p>
                <p className="text-lg font-bold text-white">{Math.round(totals.protein)}g</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Carbs</p>
                <p className="text-lg font-bold text-white">{Math.round(totals.carbs)}g</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fat</p>
                <p className="text-lg font-bold text-white">{Math.round(totals.fat)}g</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Fiber</p>
                <p className="text-lg font-bold text-white">{Math.round(totals.fiber)}g</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { SelectedFood };
