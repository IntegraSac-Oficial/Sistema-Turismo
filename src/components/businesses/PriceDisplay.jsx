import React from "react";
import { Badge } from "@/components/ui/badge";
import { Percent, Tag, Package, Gift, Clock } from "lucide-react";

export default function PriceDisplay({ product, pricingRules = [] }) {
  // Filtrar regras de preço ativas para o produto ou todo o comércio
  const activeRules = pricingRules
    .filter(rule => {
      const isActive = rule.is_active === true;
      const isInDateRange = new Date(rule.start_date) <= new Date() && new Date(rule.end_date) >= new Date();
      const isForProduct = rule.product_id === product.id || !rule.product_id;
      
      // Verificar dias da semana, se especificados
      const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
      const isValidDay = !rule.day_of_week || rule.day_of_week.length === 0 || 
                         rule.day_of_week.includes(today);
      
      return isActive && isInDateRange && isForProduct && isValidDay;
    })
    .sort((a, b) => (b.priority || 1) - (a.priority || 1)); // Ordenar por prioridade
  
  // Calcular o preço com a regra de maior prioridade
  const calculateDiscountedPrice = () => {
    if (!activeRules.length) return { price: product.price, rule: null };
    
    const topRule = activeRules[0];
    
    switch (topRule.type) {
      case "percentual":
        const discountAmount = (product.price * (topRule.value / 100));
        return { 
          price: product.price - discountAmount,
          originalPrice: product.price,
          rule: topRule,
          savings: discountAmount,
          savingsType: "percentual"
        };
        
      case "valor_fixo":
        return { 
          price: Math.max(0, product.price - topRule.value),
          originalPrice: product.price,
          rule: topRule,
          savings: topRule.value,
          savingsType: "fixo"
        };
        
      case "sazonal":
        const adjustment = (product.price * (topRule.value / 100));
        return { 
          price: product.price + adjustment, // Pode ser negativo para desconto
          originalPrice: product.price,
          rule: topRule,
          savings: -adjustment, // Negativo porque é ajuste, não economia
          savingsType: "sazonal"
        };
        
      case "pacote":
        // Para pacotes, mostramos o preço por item (dividido)
        if (topRule.package_items?.length) {
          const itemCount = topRule.package_items.length;
          const pricePerItem = topRule.value / itemCount;
          return { 
            price: pricePerItem,
            originalPrice: product.price,
            rule: topRule,
            isPackage: true
          };
        }
        return { price: product.price, rule: null };
        
      case "compre_ganhe":
        // Compre X e ganhe Y significa que o preço efetivo é X/(X+Y) do preço original
        if (topRule.buy_quantity && topRule.get_quantity) {
          const effectivePrice = (product.price * topRule.buy_quantity) / (topRule.buy_quantity + topRule.get_quantity);
          return { 
            price: effectivePrice,
            originalPrice: product.price,
            rule: topRule,
            buyQuantity: topRule.buy_quantity,
            getQuantity: topRule.get_quantity
          };
        }
        return { price: product.price, rule: null };
        
      default:
        return { price: product.price, rule: null };
    }
  };
  
  const priceInfo = calculateDiscountedPrice();
  const hasDiscount = priceInfo.rule && priceInfo.price !== product.price;
  
  // Ícone com base no tipo de promoção
  const getPromoIcon = (type) => {
    switch (type) {
      case "percentual": return <Percent className="h-3 w-3" />;
      case "valor_fixo": return <Tag className="h-3 w-3" />;
      case "pacote": return <Package className="h-3 w-3" />;
      case "compre_ganhe": return <Gift className="h-3 w-3" />;
      case "sazonal": return <Clock className="h-3 w-3" />;
      default: return null;
    }
  };
  
  return (
    <div>
      {hasDiscount ? (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#007BFF]">
              R$ {priceInfo.price.toFixed(2)}
            </span>
            
            <span className="text-sm text-gray-500 line-through">
              R$ {priceInfo.originalPrice.toFixed(2)}
            </span>
          </div>
          
          {priceInfo.rule && (
            <Badge className="mt-1 bg-blue-100 text-blue-800">
              <div className="flex items-center gap-1">
                {getPromoIcon(priceInfo.rule.type)}
                
                {priceInfo.rule.type === "percentual" && (
                  <span>{priceInfo.rule.value}% off</span>
                )}
                
                {priceInfo.rule.type === "valor_fixo" && (
                  <span>R$ {priceInfo.rule.value.toFixed(2)} off</span>
                )}
                
                {priceInfo.rule.type === "compre_ganhe" && (
                  <span>Leve {priceInfo.buyQuantity + priceInfo.getQuantity} pague {priceInfo.buyQuantity}</span>
                )}
                
                {priceInfo.rule.type === "pacote" && (
                  <span>Pacote promocional</span>
                )}
                
                {priceInfo.rule.type === "sazonal" && (
                  <span>Preço {priceInfo.rule.value >= 0 ? "alta" : "baixa"} temporada</span>
                )}
              </div>
            </Badge>
          )}
        </div>
      ) : (
        <div className="text-lg font-semibold">
          R$ {product.price?.toFixed(2)}
        </div>
      )}
    </div>
  );
}