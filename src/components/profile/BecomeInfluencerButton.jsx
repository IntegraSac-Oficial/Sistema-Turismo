import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Influencer } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import { Star, Loader2 } from "lucide-react";

export default function BecomeInfluencerButton({ entity, entityType, entityId, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    socialChannelType: "instagram",
    socialChannelUsername: "",
    pixKeyType: "CPF",
    pixKey: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.socialChannelUsername || !formData.pixKey) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }

      // Gerar código único para o influenciador
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Dados do influenciador
      const influencerData = {
        user_id: entityId,
        entity_type: entityType || 'business',
        code: code,
        name: entity?.business_name || entity?.company_name || entity?.name || "Influenciador",
        email: entity?.business_email || entity?.email || "",
        phone: entity?.business_phone || entity?.phone || "",
        city: entity?.city || "",
        social_channel: {
          type: formData.socialChannelType,
          username: formData.socialChannelUsername,
        },
        pix_key: formData.pixKey,
        pix_key_type: formData.pixKeyType,
        is_active: true,
        balance: 0,
        total_earned: 0,
        payout_requests: []
      };

      console.log("Criando influenciador com dados:", influencerData);

      // Criar influenciador
      const newInfluencer = await Influencer.create(influencerData);
      console.log("Influenciador criado:", newInfluencer);

      if (!newInfluencer || !newInfluencer.id) {
        throw new Error("Erro ao criar perfil de influenciador");
      }

      // Atualizar localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        role: 'influencer',
        influencer_id: newInfluencer.id
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Verificar se o perfil foi criado
      const verifyInfluencer = await Influencer.get(newInfluencer.id);
      if (!verifyInfluencer) {
        throw new Error("Erro ao verificar perfil de influenciador");
      }

      toast({
        title: "Sucesso!",
        description: "Seu perfil de influenciador foi criado. Você será redirecionado.",
      });

      // Pequeno delay antes do redirecionamento
      setTimeout(() => {
        setIsOpen(false);
        navigate(createPageUrl("InfluencerProfile"));
      }, 1500);

    } catch (error) {
      console.error("Erro ao criar influenciador:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o perfil de influenciador.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white ${className}`}
      >
        <Star className="w-4 h-4" />
        Torne-se Influenciador
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Programa de Influenciadores
            </DialogTitle>
            <DialogDescription>
              Torne-se um influenciador e ganhe comissões ao indicar novos clientes para a plataforma.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socialChannelType">Canal de Divulgação*</Label>
                <Select 
                  value={formData.socialChannelType} 
                  onValueChange={(value) => setFormData({...formData, socialChannelType: value})}
                >
                  <SelectTrigger id="socialChannelType">
                    <SelectValue placeholder="Selecione uma rede social" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialChannelUsername">Nome do Perfil/Canal*</Label>
                <Input
                  id="socialChannelUsername"
                  placeholder="@seu_perfil"
                  value={formData.socialChannelUsername}
                  onChange={(e) => setFormData({...formData, socialChannelUsername: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKeyType">Tipo de Chave PIX*</Label>
                <Select 
                  value={formData.pixKeyType} 
                  onValueChange={(value) => setFormData({...formData, pixKeyType: value})}
                >
                  <SelectTrigger id="pixKeyType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="PHONE">Telefone</SelectItem>
                    <SelectItem value="RANDOM">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave PIX*</Label>
                <Input
                  id="pixKey"
                  placeholder="Sua chave PIX"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({...formData, pixKey: e.target.value})}
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Concluir Cadastro"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}