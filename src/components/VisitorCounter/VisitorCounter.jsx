import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";

const VisitorCounter = () => {
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const compteurRef = doc(db, "compteurs", "visiteurs");

    async function incrementAndFetch() {
      try {
        await updateDoc(compteurRef, { total: increment(1) });
        const snap = await getDoc(compteurRef);
        setCount(snap.data().total);
      } catch (err) {
        setError("Impossible de récupérer le nombre de visites.");
      }
    }
    incrementAndFetch();
  }, []);

  if (error) {
    return (
      <div
        className="visitor-counter"
        style={{
          textAlign: "center",
          margin: "1em 0",
          fontWeight: "bold",
          color: "red",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className="visitor-counter"
      style={{ textAlign: "center", margin: "1em 0", fontWeight: "bold" }}
    >
      {count === null ? "Chargement des visites..." : `Visites : ${count}`}
    </div>
  );
};

export default VisitorCounter;
