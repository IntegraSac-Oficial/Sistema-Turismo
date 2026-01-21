import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";

export default function ColorPicker({ value, onChange }) {
  const [color, setColor] = useState(value || "#000000");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const inputRef = useRef(null);

  // Atualizar o estado interno quando o valor muda externamente
  useEffect(() => {
    if (value) {
      setColor(value);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (isValidHexColor(newColor)) {
      onChange(newColor);
    }
  };

  const handleColorPickerChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };

  const isValidHexColor = (hex) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
  };

  // Lista de cores comuns para seleção rápida
  const commonColors = [
    "#000000", // Preto
    "#FFFFFF", // Branco
    "#FF0000", // Vermelho
    "#00FF00", // Verde
    "#0000FF", // Azul
    "#FFFF00", // Amarelo
    "#FF00FF", // Magenta
    "#00FFFF", // Ciano
    "#FF5722", // Laranja
    "#9C27B0", // Roxo
    "#795548", // Marrom
    "#607D8B", // Azul Acinzentado
    "#F44336", // Vermelho Material
    "#E91E63", // Rosa
    "#9E9E9E", // Cinza
    "#2196F3", // Azul Material
    "#4CAF50", // Verde Material
    "#CDDC39", // Lima
    "#FFC107", // Âmbar
    "#009688", // Verde-azulado
    "#3F51B5", // Índigo
    "#03A9F4", // Azul claro
    "#8BC34A", // Verde claro
    "#FFEB3B"  // Amarelo Material
  ];

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: color }}
        />
        <Input
          type="text"
          value={color}
          onChange={handleInputChange}
          className="pl-9"
          placeholder="#000000"
          ref={inputRef}
        />
      </div>
      <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="px-3"
            style={{ backgroundColor: color, borderColor: '#e2e8f0' }}
          >
            <Paintbrush className={`h-4 w-4 ${isValidHexColor(color) && getContrastColor(color) === '#ffffff' ? 'text-white' : 'text-black'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="mb-2">
            <input
              type="color"
              value={color}
              onChange={handleColorPickerChange}
              className="w-full h-8 cursor-pointer"
            />
          </div>
          <div className="grid grid-cols-6 gap-1 mt-2">
            {commonColors.map((colorValue, index) => (
              <button
                key={index}
                className="w-full h-6 rounded-sm border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: colorValue }}
                onClick={() => {
                  setColor(colorValue);
                  onChange(colorValue);
                  setIsColorPickerOpen(false);
                }}
                aria-label={`Selecionar cor ${colorValue}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Função para determinar se deve usar texto preto ou branco sobre uma cor de fundo
function getContrastColor(hexColor) {
  // Remove o # se existir
  hexColor = hexColor.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  
  // Calcula a luminosidade (fórmula padrão para determinar o brilho percebido)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna branco para cores escuras e preto para cores claras
  return luminance > 0.5 ? '#000000' : '#ffffff';
}