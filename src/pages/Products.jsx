
import React, { useState, useEffect } from "react";
import { Product, Business } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Plus, Edit, Trash2, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/ui/BackButton";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    business_id: "",
    image_url: ""
  });

  useEffect(() => {
    loadProducts();
    loadBusinesses();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await Product.list();
    setProducts(data);
    setIsLoading(false);
  };

  const loadBusinesses = async () => {
    const data = await Business.list();
    setBusinesses(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "price" ? parseFloat(value) || "" : value 
    }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (selectedProduct) {
        await Product.update(selectedProduct.id, formData);
      } else {
        await Product.create(formData);
      }
      setShowForm(false);
      setSelectedProduct(null);
      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
    setIsLoading(false);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      business_id: product.business_id,
      image_url: product.image_url || ""
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      setIsLoading(true);
      await Product.delete(id);
      await loadProducts();
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      business_id: "",
      image_url: ""
    });
  };

  const getBusinessName = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    return business ? business.name : "Comércio não encontrado";
  };

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Produtos</h1>
          <Button 
            onClick={() => {
              setSelectedProduct(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Produto
          </Button>
        </div>

        {showForm ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Camarão à Milanesa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_id">Comércio</Label>
                    <Select 
                      value={formData.business_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, business_id: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um comércio" />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses.map(business => (
                          <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">R$</span>
                      </div>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="Ex: 29.90"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL da Imagem</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva o produto, ingredientes, características, etc."
                    rows={4}
                  />
                </div>

                {formData.image_url && (
                  <div className="mt-2 rounded-md overflow-hidden max-w-xs">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+encontrada"}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setSelectedProduct(null);
                      resetForm();
                    }} 
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {selectedProduct ? "Atualizar" : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Nenhum produto cadastrado</h3>
                <p className="text-gray-400 mb-4">Clique no botão acima para adicionar um produto</p>
              </div>
            ) : (
              products.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={product.image_url || "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1000&auto=format&fit=crop"} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            R$ {product.price.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditProduct(product)}
                          className="h-8 w-8 text-gray-500 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3 line-clamp-3">{product.description}</p>
                    
                    <div className="flex items-center mt-3 text-gray-500 text-sm">
                      <Store className="h-4 w-4 mr-1" />
                      <span>{getBusinessName(product.business_id)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
