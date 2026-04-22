import { useEffect, useState } from "react";

export default function WomanCard() {
  const [person, setPerson] = useState(null);

  const fetchWoman = () => {
    fetch("http://localhost:8080/api/woman")
      .then(res => res.json())
      .then(data => setPerson(data))
      .catch(() => {
        setPerson({
          name: "Error",
          fact: "Could not load data",
          image: null
        });
      });
  };

  useEffect(() => {
    fetchWoman();
  }, []);

  if (!person) return <p>Loading...</p>;

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px" }}>
      <h3>{person.name}</h3>
      <p>{person.fact}</p>

      {person.image && (
        <img src={person.image} alt={person.name} width="150" />
      )}

      <button onClick={fetchWoman}>Refresh</button>
    </div>
  );
}