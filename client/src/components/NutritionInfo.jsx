import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';

export default function NutritionInfo({ itemName, selectedSize }) {
  // ← removed toppingCounts, not needed anymore
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!itemName) return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setNutrition(null);

      // Build size-prefixed name using selected size
      const sizeName = selectedSize?.name ?? 'Small';
      const baseName = itemName.replace(/^(Small|Medium|Large)\s+/i, '').trim();
      const sizedDrinkName = `${sizeName} ${baseName}`;

      console.log('Fetching nutrition for:', sizedDrinkName);

      api.getNutrition(sizedDrinkName)
        .then(data => {
          console.log('Nutrition data:', data);
          setNutrition(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [itemName, selectedSize]); // ← only reruns when size changes

  if (loading)    return <p className="subtle" style={{fontSize: '0.85rem'}}>Loading nutrition...</p>;
  if (!nutrition) return null;

  return (
    <div className="nutrition-card">
      <h4>Estimated Nutrition</h4>
      <p className="nutrition-size-label">
        {selectedSize?.name ?? 'Small'} size
      </p>
      <div className="nutrition-grid">
        <div className="nutrition-item">
          <span className="nutrition-value">{Math.round(nutrition.calories)}</span>
          <span className="nutrition-label">Calories</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-value">{Math.round(nutrition.sugar_g)}g</span>
          <span className="nutrition-label">Sugar</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-value">{Math.round(nutrition.carbs_g)}g</span>
          <span className="nutrition-label">Carbs</span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-value">{Math.round(nutrition.fat_g)}g</span>
          <span className="nutrition-label">Fat</span>
        </div>
      </div>
      <small>*Estimates based on ingredients, toppings not included</small>
    </div>
  );
}