import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

export default function PropertyFilters({
  filters,
  onChange,
  onReset,
  cities = [],
  categories = [],
  className = ""
}) {
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value.replace(/\D/g, '');
    onChange({ ...filters, [`price_${type}`]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.city_id && filters.city_id !== 'all') count++;
    if (filters.category_id && filters.category_id !== 'all') count++;
    if (filters.property_type && filters.property_type !== 'all') count++;
    if (filters.price_min) count++;
    if (filters.price_max) count++;
    if (filters.bedrooms && filters.bedrooms !== 'all') count++;
    if (filters.bathrooms && filters.bathrooms !== 'all') count++;
    return count;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtros</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Cidade
          </label>
          <Select
            value={filters.city_id}
            onValueChange={(value) => onChange({ ...filters, city_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {cities.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Tipo de Imóvel
          </label>
          <Select
            value={filters.category_id}
            onValueChange={(value) => onChange({ ...filters, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Finalidade
          </label>
          <Select
            value={filters.property_type}
            onValueChange={(value) => onChange({ ...filters, property_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as finalidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="sale">Venda</SelectItem>
              <SelectItem value="rent">Aluguel</SelectItem>
              <SelectItem value="temporary">Temporada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Faixa de Preço
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              placeholder="Mínimo"
              value={filters.price_min ? formatCurrency(filters.price_min) : ''}
              onChange={(e) => handlePriceChange(e, 'min')}
            />
            <Input
              type="text"
              placeholder="Máximo"
              value={filters.price_max ? formatCurrency(filters.price_max) : ''}
              onChange={(e) => handlePriceChange(e, 'max')}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Quartos
          </label>
          <Select
            value={filters.bedrooms}
            onValueChange={(value) => onChange({ ...filters, bedrooms: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Banheiros
          </label>
          <Select
            value={filters.bathrooms}
            onValueChange={(value) => onChange({ ...filters, bathrooms: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualquer</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}