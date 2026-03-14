"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { nutritionAPI } from "@/lib/api";
import { FoodItem } from "@/types";
import { formatCalories, formatMacro } from "@/lib/utils";
import { Search, Loader2, X, GitCompare, Plus } from "lucide-react";

export default function NutritionFinderPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [servingSize, setServingSize] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "rice", "chicken", "beef", "pork", "salmon", "egg", "tofu", "milk",
    "bread", "noodle", "pho", "salad", "tomato", "cucumber", "carrot",
    "broccoli", "potato", "banana", "apple", "orange", "avocado"
  ];

  const filteredSuggestions = query && !hasSearched
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchFood = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);
    try {
      const response = await nutritionAPI.searchFood(q);
      const foods = response.data.results || [];
      setResults(foods);
      
      const newServingSize: Record<string, number> = {};
      foods.forEach((food: FoodItem) => {
        newServingSize[food.id] = food.servingSize;
      });
      setServingSize(prev => ({ ...prev, ...newServingSize }));
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    searchFood(suggestion);
  };

  const toggleCompare = (food: FoodItem) => {
    if (compareList.find(f => f.id === food.id)) {
      setCompareList(compareList.filter(f => f.id !== food.id));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, food]);
    }
  };

  const updateServingSize = (foodId: string, size: number) => {
    setServingSize(prev => ({ ...prev, [foodId]: size }));
    
    const food = results.find(f => f.id === foodId);
    if (food && size !== food.servingSize) {
      const ratio = size / food.servingSize;
      const updatedFood = {
        ...food,
        servingSize: size,
        calories: Math.round(food.calories * ratio),
        protein: Math.round(food.protein * ratio * 10) / 10,
        carbohydrates: Math.round(food.carbohydrates * ratio * 10) / 10,
        fat: Math.round(food.fat * ratio * 10) / 10,
      };
      
      setResults(prev => prev.map(f => f.id === foodId ? updatedFood : f));
      
      if (compareList.find(f => f.id === foodId)) {
        setCompareList(prev => prev.map(f => f.id === foodId ? updatedFood : f));
      }
    }
  };

  const clearCompare = () => {
    setCompareList([]);
    setCompareMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Finder</h1>
          <p className="text-muted-foreground">
            Search for nutritional information of any food
          </p>
        </div>
        {compareList.length > 0 && (
          <Button variant="outline" onClick={() => setCompareMode(true)} className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare ({compareList.length})
          </Button>
        )}
      </div>

      {compareMode && compareList.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Compare Foods</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Food</th>
                    {compareList.map(food => (
                      <th key={food.id} className="text-left p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{food.name}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleCompare(food)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Serving</td>
                    {compareList.map(food => (
                      <td key={food.id} className="p-2">
                        <Input
                          type="number"
                          value={servingSize[food.id] || food.servingSize}
                          onChange={(e) => updateServingSize(food.id, parseInt(e.target.value) || food.servingSize)}
                          className="h-8 w-20"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-2 font-medium">Calories</td>
                    {compareList.map(food => (
                      <td key={food.id} className="p-2">{formatCalories(food.calories)}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Protein</td>
                    {compareList.map(food => (
                      <td key={food.id} className="p-2">{formatMacro(food.protein)}g</td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <td className="p-2 font-medium">Carbs</td>
                    {compareList.map(food => (
                      <td key={food.id} className="p-2">{formatMacro(food.carbohydrates)}g</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Fat</td>
                    {compareList.map(food => (
                      <td key={food.id} className="p-2">{formatMacro(food.fat)}g</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Food</CardTitle>
            <CardDescription>
              Enter a food name to find nutritional information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative" ref={inputRef}>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., rice, chicken, salad..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && searchFood()}
                />
                <Button onClick={() => searchFood()} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : hasSearched && results.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No results found
                </p>
              ) : results.length > 0 ? (
                results.map((food) => (
                  <div
                    key={food.id}
                    className={`flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors ${compareList.find(f => f.id === food.id) ? 'bg-primary/10 border-primary' : ''}`}
                  >
                    <div 
                      className="flex-1"
                      onClick={() => {
                        if (compareMode) {
                          toggleCompare(food);
                        }
                      }}
                    >
                      <p className="font-medium">{food.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={servingSize[food.id] || food.servingSize}
                          onChange={(e) => updateServingSize(food.id, parseInt(e.target.value) || food.servingSize)}
                          className="h-6 w-20 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-muted-foreground">{food.servingUnit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{formatCalories(food.calories)}</p>
                        <p className="text-xs text-muted-foreground">calories</p>
                      </div>
                      <Button
                        variant={compareList.find(f => f.id === food.id) ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleCompare(food)}
                      >
                        {compareList.find(f => f.id === food.id) ? <X className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food Details</CardTitle>
            <CardDescription>
              Detailed nutritional information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-6">
                {results.slice(0, 1).map(food => (
                  <div key={food.id}>
                    <h3 className="text-2xl font-bold">{food.name}</h3>
                    <p className="text-muted-foreground">
                      Serving size: {servingSize[food.id] || food.servingSize} {food.servingUnit}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 rounded-lg bg-muted text-center">
                        <p className="text-3xl font-bold">{formatCalories(food.calories)}</p>
                        <p className="text-sm text-muted-foreground">Calories</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted text-center">
                        <p className="text-3xl font-bold">{formatMacro(food.protein)}</p>
                        <p className="text-sm text-muted-foreground">Protein</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted text-center">
                        <p className="text-3xl font-bold">{formatMacro(food.carbohydrates)}</p>
                        <p className="text-sm text-muted-foreground">Carbs</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted text-center">
                        <p className="text-3xl font-bold">{formatMacro(food.fat)}</p>
                        <p className="text-sm text-muted-foreground">Fat</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mt-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sugar</span>
                        <span>{food.sugar ? formatMacro(food.sugar) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fiber</span>
                        <span>{food.fiber ? formatMacro(food.fiber) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sodium</span>
                        <span>{food.sodium ? `${food.sodium}mg` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Calcium</span>
                        <span>{food.calcium ? `${food.calcium}mg` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Iron</span>
                        <span>{food.iron ? `${food.iron}mg` : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Search for a food to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
