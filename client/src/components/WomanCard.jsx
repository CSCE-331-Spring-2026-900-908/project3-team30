import { useEffect, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@400;600;700&display=swap');

  .barbie-card {
    background: linear-gradient(160deg, #fff0f7 0%, #ffe4f0 100%);
    border-radius: 24px;
    max-width: 300px;
    width: 100%;
    box-shadow:
      0 0 0 3px #ff69b4,
      0 0 0 6px #ffb6d9,
      0 12px 32px rgba(199, 21, 133, 0.25);
    overflow: hidden;
    font-family: 'Quicksand', sans-serif;
  }

  .barbie-card-header {
    background: linear-gradient(135deg, #ff69b4, #ff1493);
    padding: 12px 16px 10px;
    text-align: center;
  }

  .barbie-card-logo {
    font-family: 'Pacifico', cursive;
    font-size: 1.6rem;
    color: white;
    text-shadow: 2px 2px 0 #c71585;
    margin: 0;
    line-height: 1;
  }

  .barbie-card-tagline {
    color: rgba(255,255,255,0.85);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 3px;
  }

  .barbie-card-image-frame {
    background: linear-gradient(180deg, #ff69b4 0%, #ffb6d9 100%);
    padding: 12px 16px 0;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .barbie-card-star {
    position: absolute;
    top: 6px;
    right: 16px;
    background: #FFD700;
    color: #c71585;
    font-size: 0.55rem;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 20px;
    transform: rotate(8deg);
  }

  .barbie-card-img-border {
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #fff, #ff69b4, #fff, #ff1493);
    box-shadow: 0 6px 16px rgba(199,21,133,0.3);
  }

  .barbie-card-img {
    width: 150px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    object-position: top;
    display: block;
    border: 3px solid white;
  }

  .barbie-card-img-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffb6d9, #ff69b4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    border: 3px solid white;
  }

  .barbie-card-body {
    padding: 14px 18px 18px;
    text-align: center;
  }

  .barbie-card-name {
    font-family: 'Pacifico', cursive;
    font-size: 1.2rem;
    color: #c71585;
    margin: 0 0 6px;
    text-shadow: 1px 1px 0 #ffb6d9;
  }

  .barbie-card-divider {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 8px 0;
    color: #ff69b4;
    font-size: 0.8rem;
  }

  .barbie-card-divider::before,
  .barbie-card-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ffb6d9, transparent);
  }

  .barbie-card-fact {
    color: #8b3a62;
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.5;
    background: rgba(255, 105, 180, 0.08);
    border-radius: 12px;
    padding: 10px 12px;
    border: 1.5px dashed #ffb6d9;
    margin: 8px 0 14px;
  }

  .barbie-card-btn {
    background: linear-gradient(135deg, #ff69b4, #ff1493);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 10px 24px;
    font-family: 'Pacifico', cursive;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 0 3px 0 #c71585, 0 5px 14px rgba(199,21,133,0.3);
    transition: transform 0.15s, box-shadow 0.15s;
    position: relative;
    overflow: hidden;
  }

  .barbie-card-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%;
    height: 100%;
    background: rgba(255,255,255,0.25);
    transform: skewX(-20deg);
    transition: left 0.4s;
  }

  .barbie-card-btn:hover::after { left: 150%; }
  .barbie-card-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #c71585, 0 8px 20px rgba(199,21,133,0.4);
  }
  .barbie-card-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 0 #c71585;
  }
  .barbie-card-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .barbie-card-loading {
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .barbie-card-dots {
    display: flex;
    gap: 6px;
  }

  .barbie-card-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ff69b4;
    animation: barbieCardBounce 0.8s ease infinite;
  }
  .barbie-card-dot:nth-child(2) { animation-delay: 0.15s; background: #ff1493; }
  .barbie-card-dot:nth-child(3) { animation-delay: 0.3s;  background: #c71585; }

  @keyframes barbieCardBounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }

  .barbie-card-loading-text {
    font-family: 'Pacifico', cursive;
    color: #ff1493;
    font-size: 0.85rem;
  }
`;

export default function WomanCard() {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const fetchWoman = () => {
    setLoading(true);
    setPerson(null);
    //`${API_BASE_URL}/api/login?pin=${encodeURIComponent(pin)}`
    fetch(`${API_BASE_URL}/api/woman`) 
      .then(res => res.json())
      .then(data => {
        setPerson(data);
        setLoading(false);
      })
      .catch(() => {
        setPerson({ name: "Oops!", fact: "Could not load data", image: null });
        setLoading(false);
      });
  };

  useEffect(() => { fetchWoman(); }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="barbie-card">
        <div className="barbie-card-header">
          <p className="barbie-card-logo">Drinks in the Dreamhouse</p>
          <p className="barbie-card-tagline">✦ Woman of the Day ✦</p>
        </div>

        {loading ? (
          <div className="barbie-card-loading">
            <div className="barbie-card-dots">
              <div className="barbie-card-dot" />
              <div className="barbie-card-dot" />
              <div className="barbie-card-dot" />
            </div>
            <p className="barbie-card-loading-text">Finding your icon...</p>
          </div>
        ) : (
          <>
            <div className="barbie-card-image-frame">
              {/* <div className="barbie-card-star">⭐ Icon</div> */}
              <div className="barbie-card-img-border">
                {person?.image ? (
                  <img className="barbie-card-img" src={person.image} alt={person.name} />
                ) : (
                  <div className="barbie-card-img-placeholder">👑</div>
                )}
              </div>
            </div>

            <div className="barbie-card-body">
              <h3 className="barbie-card-name">{person?.name}</h3>
              <div className="barbie-card-divider">✦</div>
              <p className="barbie-card-fact">{person?.fact}</p>
              <button className="barbie-card-btn" onClick={fetchWoman} disabled={loading}>
                Meet Another Icon
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}


// import { useEffect, useState } from "react";

// export default function WomanCard() {
//   const [person, setPerson] = useState(null);

//   const fetchWoman = () => {
//     fetch("http://localhost:8080/api/woman")
//       .then(res => res.json())
//       .then(data => setPerson(data))
//       .catch(() => {
//         setPerson({
//           name: "Error",
//           fact: "Could not load data",
//           image: null
//         });
//       });
//   };

//   useEffect(() => {
//     fetchWoman();
//   }, []);

//   if (!person) return <p>Loading...</p>;

//   return (
//     <div style={{ border: "1px solid #ccc", padding: "15px" }}>
//       <h3>{person.name}</h3>
//       <p>{person.fact}</p>

//       {person.image && (
//         <img src={person.image} alt={person.name} width="150" />
//       )}

//       <button onClick={fetchWoman}>Refresh</button>
//     </div>
//   );
// }