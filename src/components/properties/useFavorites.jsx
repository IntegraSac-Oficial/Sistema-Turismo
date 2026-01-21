import { useState, useEffect } from 'react';
import { Property } from '@/api/entities';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar favoritos do localStorage
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('favoriteProperties');
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          setFavoriteIds(parsedFavorites);
        }
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  useEffect(() => {
    // Carregar detalhes dos imóveis favoritos
    const loadFavoriteProperties = async () => {
      if (favoriteIds.length === 0) {
        setFavoriteProperties([]);
        return;
      }

      try {
        setIsLoading(true);
        const properties = await Property.list();
        const favorites = properties.filter(prop => favoriteIds.includes(prop.id));
        setFavoriteProperties(favorites);
      } catch (error) {
        console.error('Erro ao carregar detalhes dos favoritos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteProperties();
  }, [favoriteIds]);

  const toggleFavorite = (propertyId) => {
    try {
      const newFavorites = favoriteIds.includes(propertyId)
        ? favoriteIds.filter(id => id !== propertyId)
        : [...favoriteIds, propertyId];

      setFavoriteIds(newFavorites);
      localStorage.setItem('favoriteProperties', JSON.stringify(newFavorites));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      return false;
    }
  };

  const isFavorite = (propertyId) => favoriteIds.includes(propertyId);

  return {
    favoriteIds,
    favoriteProperties,
    isLoading,
    toggleFavorite,
    isFavorite
  };
}