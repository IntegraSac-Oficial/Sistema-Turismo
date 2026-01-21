import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LocationSelector({ 
  cities, 
  beaches, 
  selectedCity, 
  selectedBeach, 
  onSelectCity, 
  onSelectBeach 
}) {
  const [beachesInCity, setBeachesInCity] = useState([]);
  
  // Atualiza as praias disponíveis com base na cidade selecionada
  useEffect(() => {
    if (selectedCity) {
      const filteredBeaches = beaches.filter(beach => beach.city_id === selectedCity);
      setBeachesInCity(filteredBeaches);
    } else {
      setBeachesInCity([]);
    }
  }, [selectedCity, beaches]);
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/2">
        <Select value={selectedCity || ""} onValueChange={onSelectCity}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#007BFF]" />
              <SelectValue placeholder="Selecione uma cidade" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Cidades</SelectLabel>
              <SelectItem value={null}>Todas as cidades</SelectItem>
              {cities.map(city => (
                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-1/2">
        <Select 
          value={selectedBeach || ""}
          onValueChange={onSelectBeach}
          disabled={!selectedCity || beachesInCity.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#007BFF]" />
              <SelectValue placeholder="Selecione uma praia" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Praias</SelectLabel>
              <SelectItem value={null}>Todas as praias</SelectItem>
              {beachesInCity.map(beach => (
                <SelectItem key={beach.id} value={beach.id}>{beach.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}