
import React, { useState, useEffect } from "react";
import { PropertyCategory } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Trash2, List, Save, X, AlertTriangle, Search } from "lucide-react";
// Remover a importação do AdminLayout se ele já é aplicado globalmente ou no componente pai
// import AdminLayout from "./AdminLayout"; 

// Lista de ícones Lucide comuns para imóveis (para sugestão ou select futuro)
const commonIcons = [
  "Home", "Building", "Building2", "Warehouse", "LandPlot", "DoorOpen", "Store", "Factory", "BedDouble", "Hotel"
];

export default function PropertyCategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    is_active: true,
    position: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await PropertyCategory.list();
      setCategories(data.sort((a, b) => (a.position || 0) - (b.position || 0)));
    } catch (error) {
      toast({ title: "Erro ao carregar categorias", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "position" ? parseInt(value, 10) || 0 : value),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCategory) {
        await PropertyCategory.update(editingCategory.id, formData);
        toast({ title: "Sucesso", description: "Categoria atualizada." });
      } else {
        await PropertyCategory.create(formData);
        toast({ title: "Sucesso", description: "Categoria criada." });
      }
      resetForm();
      loadCategories();
    } catch (error) {
      toast({ title: "Erro ao salvar categoria", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      is_active: category.is_active !== undefined ? category.is_active : true,
      position: category.position || 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      setIsLoading(true);
      try {
        await PropertyCategory.delete(id);
        toast({ title: "Sucesso", description: "Categoria excluída." });
        loadCategories();
      } catch (error) {
        toast({ title: "Erro ao excluir categoria", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", icon: "", is_active: true, position: 0 });
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Removido o <AdminLayout> daqui, pois ele deve ser aplicado uma vez no nível superior da rota admin
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <List className="w-8 h-8 mr-2 text-blue-600" />
          Gerenciar Categorias de Imóveis
        </h1>
        <Button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="w-5 h-5 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* ... o restante do JSX da página (form, tabela, etc.) permanece o mesmo ... */}
        {isFormOpen && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleFormSubmit}>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Categoria*</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="icon">Ícone (Nome do ícone Lucide React, ex: Home, Building2)</Label>
                  <Input id="icon" name="icon" value={formData.icon} onChange={handleInputChange} placeholder="Ex: Home" />
                  <p className="text-xs text-gray-500 mt-1">Sugestões: {commonIcons.slice(0,5).join(", ")}...</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="position">Ordem de Exibição (0, 1, 2...)</Label>
                        <Input type="number" id="position" name="position" value={formData.position} onChange={handleInputChange} />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Checkbox id="is_active" name="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({...prev, is_active: checked}))} />
                        <Label htmlFor="is_active">Ativa</Label>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" /> {isLoading ? "Salvando..." : "Salvar Categoria"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Categorias Cadastradas</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                icon={<Search className="h-4 w-4 text-gray-500"/>}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && !categories.length ? (
              <p>Carregando categorias...</p>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhuma categoria encontrada.</p>
                {searchTerm && <p className="text-sm text-gray-500">Tente um termo de busca diferente.</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ícone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          {category.description && <div className="text-xs text-gray-500 truncate max-w-xs">{category.description}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.icon || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.is_active ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4 mr-1" /> Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4 mr-1" /> Excluir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
