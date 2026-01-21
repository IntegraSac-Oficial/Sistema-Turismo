import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TouristForm({ tourist, users, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    user_id: tourist?.user_id || "",
    phone: tourist?.phone || "",
    is_club_member: tourist?.is_club_member || false,
    subscription_date: tourist?.subscription_date || format(new Date(), "yyyy-MM-dd")
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{tourist ? "Editar Turista" : "Novo Turista"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Usuário</Label>
            <Select 
              value={formData.user_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_club_member"
              checked={formData.is_club_member}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_club_member: checked }))}
            />
            <Label htmlFor="is_club_member">Membro do Clube de Assinantes</Label>
          </div>

          {formData.is_club_member && (
            <div className="space-y-2">
              <Label htmlFor="subscription_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Assinatura
              </Label>
              <Input
                id="subscription_date"
                name="subscription_date"
                type="date"
                value={formData.subscription_date}
                onChange={handleInputChange}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tourist ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}