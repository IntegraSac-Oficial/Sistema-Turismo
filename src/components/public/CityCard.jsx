
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Building, Waves } from "lucide-react";

export default function CityCard({ city, index = 0 }) {
  const navigate = useNavigate();

  const handleNavigate = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={(e) => handleNavigate(e, createPageUrl(`CityDetail?id=${city?.id}`))}>
        <div className="h-48 overflow-hidden relative">
          <motion.img
            src={city?.image_url || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=600&q=80"}
            alt={city?.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-bold">{city?.name}</h3>
            <p className="text-sm opacity-90">{city?.state}</p>
          </div>
        </div>
        
        <CardContent className="p-4">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {city?.description || `Descubra as maravilhas de ${city?.name}`}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Waves className="h-4 w-4 mr-2 text-blue-500" />
              <span>{city?.beaches_count || 0} praias</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-4 w-4 mr-2 text-orange-500" />
              <span>{city?.businesses_count || 0} comércios</span>
            </div>
          </div>
          
          <Button className="w-full" variant="outline">
            Explorar cidade
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
