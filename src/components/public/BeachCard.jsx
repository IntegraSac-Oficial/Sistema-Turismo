import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, MapPin, Star, ArrowRight } from "lucide-react";

export default function BeachCard({ beach, city, index = 0 }) {
  const getBeachFeatureIcon = (feature) => {
    // Função para renderizar ícones das características
    // Implemente conforme necessário
    return <span className="mr-1">{feature}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow">
        <div className="h-40 md:h-48 overflow-hidden relative">
          <motion.img
            src={beach.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"}
            alt={beach.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
        </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            {city?.name || "Santa Catarina"}
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{beach.name}</h3>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {beach.features && Array.isArray(beach.features) && beach.features.slice(0, 3).map((feature, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {beach.description || `Uma bela praia em ${city?.name || 'Santa Catarina'}.`}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-medium">4.8</span>
          </div>
          
          {/* CORREÇÃO AQUI - Usar PublicBeachDetail */}
          <Link to={createPageUrl(`PublicBeachDetail?id=${beach.id}`)}>
            <Button size="sm" className="text-blue-600 hover:text-blue-800">
              Ver detalhes
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}