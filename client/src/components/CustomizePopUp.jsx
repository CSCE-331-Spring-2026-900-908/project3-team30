import { useEffect, useMemo, useState } from 'react';
import { currency } from '../utils/format';

function applyDiscount(basePrice, percentOff) {
  if (!percentOff) return basePrice;
  return Math.round(basePrice * (1 - percentOff) * 100) / 100;
}

function getDisplayDrinkName(name) {
  return name
    .replace(/^(Small|Large)\s+/i, '')
    .trim();
}

export default function CustomizePopUp({
  item,
  alterations,
  activeHappyHour,
  onClose,
  onAddToCart,
}) {
  const [selectedMods, setSelectedMods] = useState([]);
  const [selectedSweetness, setSelectedSweetness] = useState(null);
  const [selectedIce, setSelectedIce] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const sizeOptions = [
    { name: 'Small', price: 0 },
    // { name: 'Medium', price: 0.75 },
    { name: 'Large', price: 1.5 },
  ];

  useEffect(() => {
    setSelectedMods([]);
    setSelectedSweetness(alterations.sweetness?.[0] ?? null);
    setSelectedIce(alterations.ice?.[0] ?? null);
    setSelectedSize(sizeOptions[0]);
  }, [item, alterations]);

  const basePrice = applyDiscount(item.price, activeHappyHour?.percentOff);

  const runningTotal = useMemo(() => {
    const mods = [
      ...(selectedSize ? [selectedSize] : []),
      ...selectedMods,
      ...(selectedSweetness ? [selectedSweetness] : []),
      ...(selectedIce ? [selectedIce] : []),
    ];

    return basePrice + mods.reduce((sum, mod) => sum + Number(mod.price || 0), 0);
  }, [basePrice, selectedSize, selectedMods, selectedSweetness, selectedIce]);

  const toggleMod = (mod) => {
    setSelectedMods((prev) =>
      prev.some((entry) => entry.name === mod.name)
        ? prev.filter((entry) => entry.name !== mod.name)
        : [...prev, mod]
    );
  };

  const handleAdd = () => {
    const mods = [
      ...(selectedSize ? [selectedSize] : []),
      ...selectedMods,
      ...(selectedSweetness ? [selectedSweetness] : []),
      ...(selectedIce ? [selectedIce] : []),
    ];

    onAddToCart({
      name: item.name,
      basePrice,
      image: item.image,
      modifications: mods,
      totalPrice: runningTotal,
    });
  };

  const closeWithAnimation = () => {
    setIsClosing(true);

    setTimeout(() => {
        onClose();
    }, 220);
  };

  useEffect(() => {
    const handleKey = (e) => {
        if (e.key === 'Escape') closeWithAnimation();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeWithAnimation]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

    document.body.classList.add('modal-open');
    document.body.style.top = `-${scrollY}px`;
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.documentElement.style.setProperty(
        '--modal-scrollbar-offset',
        `${scrollbarWidth}px`
    );

    

    return () => {
        document.body.classList.remove('modal-open');

        const y = parseInt(document.body.style.top || '0') * -1;

        document.body.style.top = '';
        document.body.style.paddingRight = '';

        document.documentElement.style.removeProperty('--modal-scrollbar-offset');

        window.scrollTo(0, y);
    };
  }, []);

  
  return (
    <div className="customize-backdrop" role="dialog" aria-modal="true" onClick={closeWithAnimation}>
      <div className={`customize-popup ${isClosing ? 'popup-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="customize-popup-scroll">
          <img
            src={item.image}
            alt={`${getDisplayDrinkName(item.name)} drink`}
            className="customize-popup-image"
          />

          <div className="customize-popup-header">
            <h2>{getDisplayDrinkName(item.name)}</h2>

            <p className="customize-popup-price">
                <span className="sale-price">{currency(basePrice)}</span>

                {activeHappyHour && (
                    <>
                    <span className="original-price">{currency(item.price)}</span>
                    {/* <span className="discount-price">{currency(basePrice)}</span> */}
                    <span className="discount-badge">{Math.round(activeHappyHour.percentOff * 100)}% off</span>
                    </>
                )}
            </p>
          </div>

          <div className="customize-scroll">
            <div className="customize-section">
              <h3>Customize Your Drink!</h3>

              <label className="field">
                <span>Size</span>
                <select
                  value={selectedSize?.name ?? ''}
                  onChange={(e) =>
                    setSelectedSize(
                      sizeOptions.find((option) => option.name === e.target.value) ?? null
                    )
                  }
                >
                  {sizeOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name} {option.price ? `(${currency(option.price)})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Sweetness</span>
                <select
                  value={selectedSweetness?.name ?? ''}
                  onChange={(e) =>
                    setSelectedSweetness(
                      alterations.sweetness?.find(
                        (option) => option.name === e.target.value
                      ) ?? null
                    )
                  }
                >
                  {alterations.sweetness?.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Ice</span>
                <select
                  value={selectedIce?.name ?? ''}
                  onChange={(e) =>
                    setSelectedIce(
                      alterations.ice?.find(
                        (option) => option.name === e.target.value
                      ) ?? null
                    )
                  }
                >
                  {alterations.ice?.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="customize-section">
              <h3>Toppings</h3>

              <div className="checkbox-list">
                {alterations.default?.map((mod) => (
                  <label key={mod.name} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedMods.some((entry) => entry.name === mod.name)}
                      onChange={() => toggleMod(mod)}
                    />

                    <span>{mod.name}</span>
                    <span>{currency(mod.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="customize-popup-footer">
            <strong>Total: {currency(runningTotal)}</strong>
            <div className="button-group">
                <button
                className="secondary-button inline"
                type="button"
                onClick={closeWithAnimation}
                aria-label="Cancel Drink Order"
                >
                Cancel  
                </button>
                <button
                className="primary-button inline"
                type="button"
                onClick={handleAdd}
                >
                Add to Cart
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}