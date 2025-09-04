import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase";
import "./VisitorCounter.scss";

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

  return (
    <div
      className={"visitor-counter" + (error ? " visitor-counter--error" : "")}
    >
      {error
        ? error
        : count === null
        ? "Chargement des visites..."
        : `Visites : ${count}`}
    </div>
  );
};

export default VisitorCounter;
