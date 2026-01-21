import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { City } from "@/api/entities";

export default function TourismCards({ title = "Destinos em Destaque", limit = 6, cities = [], isLoading = true }) {
  const [displayCities, setDisplayCities] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (cities && cities.length > 0) {
      // Filtrar cidades para remover duplicidades pelo nome
      const uniqueCities = [];
      const cityNames = new Set();
      
      cities.forEach(city => {
        // Usar apenas cidades que tenham nome e que não tenham sido adicionadas antes
        if (city.name && !cityNames.has(city.name.toLowerCase())) {
          cityNames.add(city.name.toLowerCase());
          uniqueCities.push({
            id: city.id,
            name: city.name,
            description: city.description || "Sem descrição disponível",
            image_url: city.image_url || "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?q=80&w=2121&auto=format&fit=crop",
            beaches_count: city.beaches_count || 0,
            // Valores fictícios para demonstração se não existirem
            rating: city.rating || (Math.random() * 2 + 3).toFixed(1)
          });
        }
      });
      
      setDisplayCities(uniqueCities.slice(0, limit));
    } else {
      setDisplayCities([]);
    }
  }, [cities, limit]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full hover:bg-blue-50 hover:text-blue-600"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full hover:bg-blue-50 hover:text-blue-600"
              onClick={scrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {displayCities.length === 0 && !isLoading ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">Nenhuma cidade encontrada.</p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
          >
            {isLoading ? (
              // Esqueletos de carregamento
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="min-w-[350px] flex-none animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 bg-white rounded-b-lg border border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              displayCities.map((city) => (
                <Link 
                  key={city.id} 
                  to={createPageUrl(`CityDetail?id=${city.id}`)}
                  className="min-w-[350px] flex-none hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
                >
                  <div className="relative h-48">
                    <img 
                      src={city.image_url} 
                      alt={city.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 bg-white border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{city.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {city.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{city.rating}</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {city.beaches_count} {city.beaches_count === 1 ? 'praia' : 'praias'}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}