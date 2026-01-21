
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Business } from "@/api/entities";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductForm from "@/components/businesses/ProductForm";

export default function BusinessProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const businessId = queryParams.get('id');
    
    if (!businessId) {
      loadFromLocalStorage();
    } else {
      loadBusinessData(businessId);
    }
  }, [location.search]);

  const loadFromLocalStorage = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        navigate(createPageUrl("UserAccount"));
        return;
      }

      const currentUser = JSON.parse(currentUserStr);
      if (!currentUser.business_id) {
        navigate(createPageUrl("EditBusiness"));
        return;
      }

      await loadBusinessData(currentUser.business_id);
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do comércio",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const loadBusinessData = async (businessId) => {
    try {
      setLoading(true);
      const businessData = await Business.get(businessId);
      setBusiness(businessData);

      // Atualizar localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.business_id !== businessId) {
          localStorage.setItem('currentUser', JSON.stringify({
            ...currentUser,
            business_id: businessId
          }));
        }
      }

      await loadProducts(businessId);
    } catch (error) {
      console.error("Erro ao carregar dados do comércio:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do comércio",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const loadProducts = async (businessId) => {
    try {
      const productsData = await Product.filter({ business_id: businessId });
      setProducts(productsData);
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(productsData
        .map(product => product.category)
        .filter(category => category)
      )];
      
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await Product.delete(productId);
        setProducts(products.filter(p => p.id !== productId));
        toast({
          title: "Sucesso",
          description: "Produto excluído com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o produto",
          variant: "destructive"
        });
      }
    }
  };

  const handleFormSubmit = async (productData) => {
    try {
      if (editingProduct) {
        // Atualizar
        await Product.update(editingProduct.id, productData);
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id ? { ...p, ...productData } : p
        );
        setProducts(updatedProducts);
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
        });
      } else {
        // Criar novo
        const newProduct = await Product.create(productData);
        setProducts([...products, newProduct]);
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso",
        });
      }
      
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const updatedProduct = await Product.update(product.id, {
        is_featured: !product.is_featured
      });
      
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, is_featured: !p.is_featured } : p
      );
      
      setProducts(updatedProducts);
      
      toast({
        title: product.is_featured ? "Produto removido dos destaques" : "Produto destacado com sucesso",
        duration: 2000,
      });
    } catch (error) {
      console.error("Erro ao destacar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o destaque",
        variant: "destructive"
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "R$ 0,00";
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProductForm
        business={business}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

const renderProducts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="aspect-video relative">
            {product.image_url ? (
              <img 
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
            )}
            {product.is_featured && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                <Star className="h-3 w-3 inline mr-1" />
                Destaque
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="text-lg font-medium mb-1">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.category || "Sem categoria"}</p>
            {product.description && (
              <p className="mt-2 text-gray-600 text-sm line-clamp-2">{product.description}</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <p className="font-bold text-lg">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(product.price)}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 mb-2 flex items-center hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold flex items-center">
            <ShoppingBag className="mr-2" />
            Produtos e Serviços
          </h1>
          <p className="text-gray-500">{business?.business_name}</p>
        </div>
        
        <Button onClick={handleAddProduct} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar produtos..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    {filteredProducts.length > 0 ? (
      renderProducts()
    ) : (
      <div className="text-center p-10">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">Nenhum produto encontrado</h3>
        <p className="mt-1 text-gray-500">
          {products.length === 0
            ? "Você ainda não cadastrou nenhum produto."
            : "Nenhum produto corresponde aos filtros aplicados."}
        </p>
      </div>
    )}
  </div>
);
}
