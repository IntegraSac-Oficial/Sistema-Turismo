import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Páginas públicas
import Public from './pages/Public';
import PublicCities from './pages/PublicCities';
import PublicBeaches from './pages/PublicBeaches';
import PublicBeachDetail from './pages/PublicBeachDetail';
import PublicBusinesses from './pages/PublicBusinesses';
import PublicBusinessDetail from './pages/PublicBusinessDetail';
import PublicProperties from './pages/PublicProperties';
import PublicServiceProviders from './pages/PublicServiceProviders';
import PublicServiceProviderDetail from './pages/PublicServiceProviderDetail';
import CityDetail from './pages/CityDetail';
import PropertyDetail from './pages/PropertyDetail';

// Páginas de cadastro
import Cadastro from './pages/Cadastro';
import TouristSignup from './pages/TouristSignup';
import InfluencerSignup from './pages/InfluencerSignup';
import RealtorSignup from './pages/RealtorSignup';

// Páginas de planos
import SubscriptionPlans from './pages/SubscriptionPlans';

// Páginas de eventos
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';

// Páginas de usuário
import UserAccount from './pages/UserAccount';
import UserProfile from './pages/UserProfile';
import MembershipCard from './pages/MembershipCard';

// Páginas de comunidade
import Community from './pages/Community';
import LocalGuides from './pages/LocalGuides';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota principal */}
      <Route path="/" element={<Public />} />
      
      {/* Rotas públicas - Cidades */}
      <Route path="/publiccities" element={<PublicCities />} />
      <Route path="/cidades" element={<PublicCities />} />
      <Route path="/citydetail" element={<CityDetail />} />
      
      {/* Rotas públicas - Praias */}
      <Route path="/publicbeaches" element={<PublicBeaches />} />
      <Route path="/praias" element={<PublicBeaches />} />
      <Route path="/publicbeachdetail" element={<PublicBeachDetail />} />
      
      {/* Rotas públicas - Imóveis */}
      <Route path="/publicproperties" element={<PublicProperties />} />
      <Route path="/imoveis" element={<PublicProperties />} />
      <Route path="/propertydetail" element={<PropertyDetail />} />
      
      {/* Rotas públicas - Comércios */}
      <Route path="/publicbusinesses" element={<PublicBusinesses />} />
      <Route path="/comercios" element={<PublicBusinesses />} />
      <Route path="/publicbusinessdetail" element={<PublicBusinessDetail />} />
      
      {/* Rotas públicas - Prestadores */}
      <Route path="/publicserviceproviders" element={<PublicServiceProviders />} />
      <Route path="/prestadores" element={<PublicServiceProviders />} />
      <Route path="/publicserviceproviderdetail" element={<PublicServiceProviderDetail />} />
      
      {/* Cadastros */}
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/touristsignup" element={<TouristSignup />} />
      <Route path="/influencersignup" element={<InfluencerSignup />} />
      <Route path="/realtorsignup" element={<RealtorSignup />} />
      <Route path="/cadastrarimobiliaria" element={<RealtorSignup />} />
      
      {/* Planos e Clube */}
      <Route path="/subscriptionplans" element={<SubscriptionPlans />} />
      <Route path="/clube" element={<SubscriptionPlans />} />
      
      {/* Eventos */}
      <Route path="/events" element={<Events />} />
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventdetail" element={<EventDetail />} />
      
      {/* Comunidade */}
      <Route path="/community" element={<Community />} />
      <Route path="/comunidade" element={<Community />} />
      <Route path="/criarcomunidade" element={<Community />} />
      <Route path="/localguides" element={<LocalGuides />} />
      
      {/* Usuário */}
      <Route path="/useraccount" element={<UserAccount />} />
      <Route path="/minhaconta" element={<UserAccount />} />
      <Route path="/entrar" element={<TouristSignup />} />
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/userprofile/:profileUserId" element={<UserProfile />} />
      <Route path="/membershipcard" element={<MembershipCard />} />
      
      {/* Rota 404 - redireciona para home */}
      <Route path="*" element={<Public />} />
    </Routes>
  );
}
