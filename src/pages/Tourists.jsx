
import React, { useState, useEffect } from "react";
import { Tourist, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Edit, Trash2, Phone, Calendar, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import TouristForm from "../components/tourists/TouristForm";
import MembershipCard from "../components/tourists/MembershipCard";
import BackButton from "@/components/ui/BackButton";

export default function Tourists() {
  const [tourists, setTourists] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [showMembershipCard, setShowMembershipCard] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    loadTourists();
    loadUsers();
  }, []);

  const loadTourists = async () => {
    setIsLoading(true);
    const data = await Tourist.list();
    setTourists(data);
    setIsLoading(false);
  };

  const loadUsers = async () => {
    const data = await User.list();
    setUsers(data);
  };

  const handleCreateTourist = async (touristData) => {
    setIsLoading(true);
    if (selectedTourist) {
      await Tourist.update(selectedTourist.id, touristData);
    } else {
      await Tourist.create(touristData);
    }
    setShowForm(false);
    setSelectedTourist(null);
    await loadTourists();
    setIsLoading(false);
  };

  const handleEditTourist = (tourist) => {
    setSelectedTourist(tourist);
    setShowForm(true);
  };

  const handleDeleteTourist = async (id) => {
    if (confirm("Tem certeza que deseja excluir este turista?")) {
      setIsLoading(true);
      await Tourist.delete(id);
      await loadTourists();
      setIsLoading(false);
    }
  };

  const handleShowMembershipCard = (tourist) => {
    setSelectedMember(tourist);
    setShowMembershipCard(true);
  };

  const getUserInfo = (userId) => {
    const user = users.find(u => u.id === userId);
    return user || { full_name: "Usuário não encontrado", email: "" };
  };

  const filteredTourists = selectedTab === "all" 
    ? tourists 
    : tourists.filter(t => (selectedTab === "members" ? t.is_club_member : !t.is_club_member));

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Turistas</h1>
          <Button 
            onClick={() => {
              setSelectedTourist(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Novo Turista
          </Button>
        </div>

        {showForm ? (
          <TouristForm 
            tourist={selectedTourist} 
            users={users} 
            onSubmit={handleCreateTourist} 
            onCancel={() => {
              setShowForm(false);
              setSelectedTourist(null);
            }}
            isLoading={isLoading}
          />
        ) : (
          <>
            <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="members">Assinantes</TabsTrigger>
                <TabsTrigger value="non_members">Não Assinantes</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                      <div className="h-16 bg-gray-200 rounded" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredTourists.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">Nenhum turista encontrado</h3>
                  <p className="text-gray-400 mb-4">Clique no botão acima para adicionar um turista</p>
                </div>
              ) : (
                filteredTourists.map(tourist => {
                  const user = getUserInfo(tourist.user_id);
                  return (
                    <Card key={tourist.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {user.full_name[0]?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">{user.full_name}</h3>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                              </div>
                            </div>
                            {tourist.is_club_member && (
                              <Badge className="mt-2 bg-orange-500">Membro do Clube</Badge>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditTourist(tourist)}
                              className="h-8 w-8 text-gray-500 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteTourist(tourist.id)}
                              className="h-8 w-8 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {tourist.phone && (
                          <div className="flex items-center mt-3 text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>{tourist.phone}</span>
                          </div>
                        )}
                        
                        {tourist.is_club_member && tourist.subscription_date && (
                          <div className="flex items-center mt-2 text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Assinante desde: {format(new Date(tourist.subscription_date), "dd/MM/yyyy")}</span>
                          </div>
                        )}
                        
                        {tourist.is_club_member && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4 w-full"
                            onClick={() => handleShowMembershipCard(tourist)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Ver Cartão de Membro
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            
            {showMembershipCard && selectedMember && (
              <MembershipCard 
                tourist={selectedMember} 
                user={getUserInfo(selectedMember.user_id)} 
                onClose={() => setShowMembershipCard(false)} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
