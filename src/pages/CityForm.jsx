import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { City } from "@/api/entities";
import { createPageUrl } from "@/utils";
import BackButton from "@/components/ui/BackButton";
import CityForm from "@/components/cities/CityForm";

export default function CityFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCity = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const cityId = params.get("id");

        if (cityId) {
          const cityData = await City.get(cityId);
          setCity(cityData);
        }
      } catch (error) {
        console.error("Erro ao carregar cidade:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCity();
  }, [location.search]);

  const handleSubmit = async (data) => {
    try {
      if (city) {
        await City.update(city.id, data);
      } else {
        await City.create(data);
      }
      navigate(createPageUrl("Cities"));
    } catch (error) {
      console.error("Erro ao salvar cidade:", error);
      alert("Erro ao salvar os dados da cidade. Por favor, tente novamente.");
    }
  };

  const handleCancel = () => {
    navigate(createPageUrl("Cities"));
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <CityForm 
          city={city} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
}