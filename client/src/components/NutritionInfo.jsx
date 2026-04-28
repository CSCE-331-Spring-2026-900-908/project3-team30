import { useEffect, useState } from 'react';
import { api } from '../services/api'; // ← ADD THIS IMPORT

export default function NutritionInfo({ itemName }) {
  console.log('NutritionInfo rendering for:', itemName);
  
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemName) return;
    setLoading(true);
    setNutrition(null);

    // ✅ Use api.js instead of raw fetch
    api.getNutrition(itemName)
      .then(data => {
        console.log('Nutrition data:', data);
        setNutrition(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Nutrition error:', err);
        setLoading(false);
      });
  }, [itemName]);

  if (loading)    return <p className="subtle">Loading nutrition info...</p>;
  if (!nutrition) return null;

  return (
    <div className="nutrition-card">
      <h4>Estimated Nutrition</h4>
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
      <small>*Estimates based on ingredients</small>
    </div>
  );
}