
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CityCard({ city }) {
  const navigate = useNavigate();

  const handleNavigate = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  // Rest of the component code will go here. For example:
  return (
    <div>
      {/* Replace this with your actual city card content */}
      <h3>{city?.name}</h3>
      <p>Population: {city?.population}</p>
      <a
        href={`/city/${city?.id}`}
        onClick={(e) => handleNavigate(e, `/city/${city?.id}`)}
      >
        View Details
      </a>
    </div>
  );
}
