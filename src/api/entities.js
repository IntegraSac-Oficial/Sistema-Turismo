import { base44 } from './base44Client';
import { 
  mockCities, 
  mockBeaches, 
  mockProperties, 
  mockBusinesses, 
  mockSiteConfig,
  mockRealtors,
  mockPropertyCategories,
  mockServiceProviders,
  mockEvents,
  mockSubscriptionPlans,
  mockPosts,
  mockLocalGuides
} from './mockData';

// Modo mock ativado
const USE_MOCK = true;

// Helper para criar entidades mock
const createMockEntity = (data) => ({
  list: async () => data,
  filter: async (filters) => {
    // Simula filtros básicos
    return data.filter(item => {
      for (let key in filters) {
        if (item[key] !== filters[key]) return false;
      }
      return true;
    });
  },
  get: async (id) => data.find(item => item.id === id),
  create: async (newData) => ({ id: Date.now().toString(), ...newData }),
  update: async (id, updateData) => ({ id, ...updateData }),
  delete: async (id) => ({ success: true })
});

// Entidades com dados mock
export const City = USE_MOCK ? createMockEntity(mockCities) : base44.entities.City;
export const Beach = USE_MOCK ? createMockEntity(mockBeaches) : base44.entities.Beach;
export const Business = USE_MOCK ? createMockEntity(mockBusinesses) : base44.entities.Business;
export const Property = USE_MOCK ? createMockEntity(mockProperties) : base44.entities.Property;
export const Realtor = USE_MOCK ? createMockEntity(mockRealtors) : base44.entities.Realtor;
export const PropertyCategory = USE_MOCK ? createMockEntity(mockPropertyCategories) : base44.entities.PropertyCategory;
export const ServiceProvider = USE_MOCK ? createMockEntity(mockServiceProviders) : base44.entities.ServiceProvider;
export const Event = USE_MOCK ? createMockEntity(mockEvents) : base44.entities.Event;
export const SubscriptionPlan = USE_MOCK ? createMockEntity(mockSubscriptionPlans) : base44.entities.SubscriptionPlan;
export const Post = USE_MOCK ? createMockEntity(mockPosts) : base44.entities.Post;
export const LocalGuide = USE_MOCK ? createMockEntity(mockLocalGuides) : base44.entities.LocalGuide;

// SiteConfig especial (retorna array com um item)
export const SiteConfig = USE_MOCK ? {
  list: async () => [mockSiteConfig],
  get: async () => mockSiteConfig,
  update: async (id, data) => ({ ...mockSiteConfig, ...data })
} : base44.entities.SiteConfig;

// Outras entidades (sem mock por enquanto)
export const Tourist = base44.entities.Tourist;
export const Product = base44.entities.Product;
export const Review = base44.entities.Review;
export const UserProfile = base44.entities.UserProfile;
export const Comment = base44.entities.Comment;
export const UserConnection = base44.entities.UserConnection;
export const EventAttendee = base44.entities.EventAttendee;
export const SavedGuide = base44.entities.SavedGuide;
export const Advertiser = base44.entities.Advertiser;
export const Advertisement = base44.entities.Advertisement;
export const UserSubscription = base44.entities.UserSubscription;
export const PromotionalBanner = base44.entities.PromotionalBanner;
export const UserAchievement = base44.entities.UserAchievement;
export const Achievement = base44.entities.Achievement;
export const UserPoints = base44.entities.UserPoints;
export const PointTransaction = base44.entities.PointTransaction;
export const PricingRule = base44.entities.PricingRule;
export const BenefitClubConfig = base44.entities.BenefitClubConfig;
export const Influencer = base44.entities.Influencer;
export const InfluencerCommission = base44.entities.InfluencerCommission;
export const CommissionRate = base44.entities.CommissionRate;
export const InfluencerCardSettings = base44.entities.InfluencerCardSettings;
export const CityBanner = base44.entities.CityBanner;
export const BannerCategory = base44.entities.BannerCategory;
export const BusinessCredential = base44.entities.BusinessCredential;
export const BusinessSubscription = base44.entities.BusinessSubscription;
export const Transaction = base44.entities.Transaction;
export const BusinessWallet = base44.entities.BusinessWallet;
export const Role = base44.entities.Role;
export const UserRole = base44.entities.UserRole;
export const Permission = base44.entities.Permission;
export const BusinessTransaction = base44.entities.BusinessTransaction;
export const LoyaltyRule = base44.entities.LoyaltyRule;
export const BannerAnalytics = base44.entities.BannerAnalytics;

// Mock para User.me()
export const User = USE_MOCK ? {
  me: async () => null, // Simula usuário não logado
  login: async () => ({ success: true }),
  logout: async () => ({ success: true }),
  register: async () => ({ success: true }),
  list: async () => [], // Lista vazia de usuários
  get: async (id) => null,
  update: async (id, data) => ({ success: true })
} : base44.auth;