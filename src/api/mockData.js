// Mock data baseado no banco de dados real
export const mockCities = [
  {
    id: "67cdc32459c2f17692605cc1",
    name: "Florianópolis",
    state: "Santa Catarina",
    description: "Florianópolis, a capital do estado de Santa Catarina no sul do Brasil, é maioritariamente constituída pela Ilha de Santa Catarina, com 54 km de comprimento. É famosa pelas suas praias, incluindo estâncias turísticas populares como a Praia dos Ingleses na extremidade norte da ilha.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9f5528_como-e-morar-em-florianopolis-sc-saiba-mais-sobre-a-capital-catarinense.jpg",
    population: 82383,
    beaches_count: 42,
    businesses_count: 15,
    providers_count: 8,
    average_rating: 4.5
  },
  {
    id: "67cdc32459c2f17692605cc2",
    name: "Balneário Camboriú",
    state: "Santa Catarina",
    description: "O turismo é a principal fonte de renda da cidade. O município conta com uma população fixa de 128 mil habitantes, mas na alta temporada cerca de 4 milhões de turistas se revezam entre os meses de dezembro, janeiro e fevereiro.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/66029c_camboriu.png",
    population: 139155,
    beaches_count: 10,
    businesses_count: 25,
    providers_count: 12,
    average_rating: 4.7
  },
  {
    id: "67cf30412efcee033024d3d0",
    name: "Bombinhas",
    state: "Santa Catarina",
    description: "Conhecida como a Capital do Mergulho Ecológico, Bombinhas possui algumas das mais belas praias do Brasil. Com águas cristalinas e preservação ambiental, é ideal para quem busca contato com a natureza.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b99215_praias-de-bombinhas-santa-catarina-14.jpg",
    population: 25058,
    beaches_count: 39,
    businesses_count: 18,
    providers_count: 10,
    average_rating: 4.8
  },
  {
    id: "67db2cffee2528e16d1600ae",
    name: "São Francisco do Sul",
    state: "Santa Catarina",
    description: "São Francisco do Sul, conforme sua história assinala, é a primeira povoação de Santa Catarina, e sua fundação ocorreu em 1847.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/884200_VILLAAAAAA.webp",
    population: 52674,
    beaches_count: 14,
    businesses_count: 20,
    providers_count: 15,
    average_rating: 4.3
  }
];

export const mockBeaches = [
  {
    id: "67cf30412efcee033024d3d2",
    name: "Praia da Enseada",
    city_id: "67db2cffee2528e16d1600ae",
    description: "A Praia da Enseada é a principal praia de São Francisco do Sul, em Santa Catarina. É um destino popular para famílias com crianças, devido às suas águas calmas e tranquilas.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9d257a_enseada1.jpg",
    main_activity: "caminhada",
    sea_type: "calmo",
    average_rating: 4.6
  },
  {
    id: "67cf30412efcee033024d3d3",
    name: "Praia da Joaquina",
    city_id: "67cdc32459c2f17692605cc1",
    description: "Conhecida internacionalmente por suas ondas perfeitas para o surf, a Praia da Joaquina é palco de campeonatos e atrai surfistas do mundo todo.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a134ea_joaquina-3.jpg",
    main_activity: "surf",
    sea_type: "ondas_medias",
    average_rating: 4.8
  },
  {
    id: "67cf30412efcee033024d3d5",
    name: "Praia de Bombas",
    city_id: "67cf30412efcee033024d3d0",
    description: "Uma das praias mais frequentadas de Bombinhas, possui boa infraestrutura e é ideal para famílias. Suas águas são calmas e perfeitas para banho.",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/038170_PORTOBELO.jpg",
    main_activity: "relaxamento",
    sea_type: "calmo",
    average_rating: 4.5
  }
];

export const mockProperties = [
  {
    id: "680409ec7ba8b281f6e092a3",
    title: "Apartamento na praia",
    description: "Apartamento moderno com vista para o mar, localizado em área nobre de São Francisco do Sul. Possui 5 quartos, sendo 2 suítes, e excelente infraestrutura.",
    category_id: "68192dde6974e026f00b9f56",
    price: 350000,
    property_type: "sale",
    city_id: "67db2cffee2528e16d1600ae",
    address: "rua dionisio cerqueira, 351",
    neighborhood: "ubatuba",
    area: 564,
    bedrooms: 5,
    suites: 2,
    bathrooms: 3,
    parking_spots: 0,
    main_image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/16c4dc_Bannersite-Naturale.jpg",
    images: [
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/51ec83_H_DR_PH_3D_APTO_TIPO_01_WEB.webp",
      "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a3dc69_Banner.jpg"
    ],
    realtor_id: "681977e5e5240b6855a6d4ad",
    is_featured: true,
    status: "active",
    views_count: 9
  }
];

export const mockBusinesses = [
  {
    id: "67cf30422efcee033024d3d8",
    business_name: "Restaurante Maré Alta",
    business_type: "restaurante",
    business_email: "contato@marealta.com",
    business_phone: "(47) 3333-4444",
    city_id: "67cdc32459c2f17692605cc2",
    status: "active",
    image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop",
    description: "Especializado em frutos do mar frescos, o Restaurante Maré Alta oferece uma experiência gastronômica com vista para o mar.",
    address: "Av. Brazil, 10214"
  },
  {
    id: "67cf30422efcee033024d3d9",
    business_name: "Pousada Brisa do Mar",
    business_type: "pousada",
    business_email: "contato@brisadomar.com",
    business_phone: "(47) 3333-5555",
    city_id: "67dc3da3e0e03c926b15e6e1",
    status: "active",
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    description: "Pousada charmosa localizada a poucos metros da Praia de Bombas. Oferece quartos confortáveis com café da manhã incluso.",
    address: "Rua das Flores, 567"
  },
  {
    id: "67e19d23cab81a52340d86bc",
    business_name: "in SE7E Tecnologia",
    business_type: "tecnologia",
    business_email: "contato@inse7e.com",
    business_phone: "(47) 99131-5105",
    city_id: "67db2cffee2528e16d1600ae",
    status: "active",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5f1211_LOGO2024N7-1.png",
    description: "Desenvolvimento de Sistemas CRM/ERP- Sistemas delivery, Sites, aplicativos",
    address: "Av. Ubatuba",
    website: "https://in-se7e.com.br"
  }
];

export const mockSiteConfig = {
  id: "67d84c03ea3d3ec3f1510c96",
  geral: {
    site_name: "Praias Catarinenses",
    contact_email: "contato@praiascatarinenses.com",
    contact_phone: "(47) 99131-5105",
    footer_copyright: "© 2012/2025 Praias Catarinenses. Todos os direitos reservados."
  },
  aparencia: {
    logo_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b97ed5_header3.png",
    logo_width: 250,
    logo_height: 60,
    primary_color: "#007BFF",
    secondary_color: "#FF5722"
  },
  pagamentos: {
    gateway: "pix_direto",
    pix: {
      key: "46427105000122",
      key_type: "CNPJ",
      beneficiario: "in sete aceleradora ltda",
      cidade: "joinville"
    }
  },
  redes_sociais: {
    facebook: "https://facebook.com/praiascatarinenses",
    instagram: "https://instagram.com/praiascatarinenses",
    youtube: "https://youtube.com/praiascatarinenses"
  },
  banner_header: {
    titulo: "DISCOVER BEACHES WITH A CUSTOM GUIDE",
    subtitulo: "O guia completo das melhores praias, hotéis, restaurantes e serviços de Santa Catarina",
    tipo_fundo: "imagem",
    cor_fundo: "#007BFF",
    imagem_fundo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5a2d1c_background-surfing-01.jpg",
    botao_primario: {
      texto: "Criar Conta Gratuita",
      cor_fundo: "#ffffff",
      cor_texto: "#007BFF",
      cor_hover: "#e5e7eb",
      link: "/Cadastro"
    },
    botao_secundario: {
      texto: "Ver o melhor Plano",
      cor_fundo: "#ff7300",
      cor_borda: "#ffffff",
      cor_texto: "#ffffff",
      cor_hover: "rgba(255,255,255,0.1)",
      link: "/SubscriptionPlans"
    }
  }
};

export const mockRealtors = [
  {
    id: "681977e5e5240b6855a6d4ad",
    name: "João Silva Imóveis",
    email: "joao@imoveissc.com",
    phone: "(47) 99999-8888",
    creci: "12345-SC"
  }
];

export const mockPropertyCategories = [
  {
    id: "68192dde6974e026f00b9f56",
    name: "Apartamento"
  },
  {
    id: "68192dde6974e026f00b9f57",
    name: "Casa"
  },
  {
    id: "68192dde6974e026f00b9f58",
    name: "Terreno"
  }
];

export const mockServiceProviders = [
  {
    id: "sp1",
    name: "João Silva",
    service_type: "Eletricista",
    city_id: "67cdc32459c2f17692605cc1",
    description: "Eletricista profissional com mais de 10 anos de experiência em instalações residenciais e comerciais.",
    phone: "(47) 99999-8888",
    email: "joao@eletrica.com",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    status: "Disponível",
    average_rating: 4.8
  },
  {
    id: "sp2",
    name: "Maria Oliveira",
    service_type: "Diarista",
    city_id: "67cdc32459c2f17692605cc2",
    description: "Diarista com referências e experiência em limpeza de imóveis, apartamentos e casas de temporada.",
    phone: "(47) 99999-7777",
    email: "maria@limpeza.com",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    status: "Disponível",
    average_rating: 4.9
  },
  {
    id: "sp3",
    name: "Carlos Santos",
    service_type: "Pintor",
    city_id: "67cf30412efcee033024d3d0",
    description: "Pintor profissional especializado em pintura residencial e comercial.",
    phone: "(47) 99999-6666",
    email: "carlos@pintura.com",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    status: "Disponível",
    average_rating: 4.7
  }
];

export const mockEvents = [
  {
    id: "ev1",
    title: "Festival Cultural de Bombinhas",
    description: "O Festival Cultural de Bombinhas é uma celebração das tradições, arte e cultura açoriana presente em Santa Catarina.",
    start_date: "2025-04-09",
    end_date: "2025-04-09",
    start_time: "10:00",
    city_id: "67cf30412efcee033024d3d0",
    location_name: "Bombinhas",
    location_type: "city",
    location_id: "67cf30412efcee033024d3d0",
    image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80",
    category: "cultural",
    is_featured: true
  },
  {
    id: "ev2",
    title: "Réveillon em Balneário Camboriú",
    description: "Venha celebrar a virada do ano em um dos melhores Réveillons do Brasil! A festa na Praia Central de Balneário Camboriú.",
    start_date: "2025-12-30",
    end_date: "2025-12-31",
    start_time: "20:00",
    city_id: "67cdc32459c2f17692605cc2",
    location_name: "Praia Central",
    location_type: "city",
    location_id: "67cdc32459c2f17692605cc2",
    image_url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=600&q=80",
    category: "festivo",
    is_featured: true
  }
];

export const mockSubscriptionPlans = [
  {
    id: "plan1",
    name: "Plano Básico",
    description: "Acesso básico aos benefícios do clube",
    price: 29.90,
    duration: "mensal",
    benefits: ["Descontos em estabelecimentos parceiros", "Acesso a eventos exclusivos"]
  },
  {
    id: "plan2",
    name: "Plano Premium",
    description: "Acesso completo a todos os benefícios",
    price: 79.90,
    duration: "mensal",
    benefits: ["Todos os benefícios do Básico", "Descontos maiores", "Prioridade em eventos", "Cartão físico personalizado"]
  }
];

export const mockPosts = [
  {
    id: "post1",
    title: "Melhores praias para surf em SC",
    content: "Compartilhando minha experiência nas melhores praias para surf em Santa Catarina. A Praia da Joaquina em Florianópolis é simplesmente incrível!",
    author_id: "user1",
    author_name: "João Surfista",
    author_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    created_at: "2025-01-15T10:30:00",
    likes_count: 45,
    comments_count: 12,
    image_url: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600"
  },
  {
    id: "post2",
    title: "Roteiro de 3 dias em Bombinhas",
    content: "Acabei de voltar de Bombinhas e quero compartilhar meu roteiro de 3 dias. Visitei 8 praias diferentes e todas são maravilhosas!",
    author_id: "user2",
    author_name: "Maria Viajante",
    author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    created_at: "2025-01-18T14:20:00",
    likes_count: 67,
    comments_count: 23,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600"
  },
  {
    id: "post3",
    title: "Restaurantes imperdíveis em Floripa",
    content: "Lista dos melhores restaurantes de frutos do mar que visitei em Florianópolis. Todos com vista para o mar!",
    author_id: "user3",
    author_name: "Carlos Foodie",
    author_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    created_at: "2025-01-20T09:15:00",
    likes_count: 89,
    comments_count: 34,
    image_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600"
  }
];

export const mockLocalGuides = [
  {
    id: "guide1",
    title: "Guia Completo de Bombinhas",
    description: "Descubra as 39 praias de Bombinhas, os melhores restaurantes, pousadas e dicas de mergulho.",
    author_id: "user1",
    author_name: "João Surfista",
    city_id: "67cf30412efcee033024d3d0",
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600",
    likes_count: 234,
    saves_count: 156,
    created_at: "2025-01-10T10:00:00"
  },
  {
    id: "guide2",
    title: "Florianópolis em 7 Dias",
    description: "Roteiro completo de uma semana em Floripa, incluindo praias do norte e sul da ilha.",
    author_id: "user2",
    author_name: "Maria Viajante",
    city_id: "67cdc32459c2f17692605cc1",
    image_url: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600",
    likes_count: 456,
    saves_count: 289,
    created_at: "2025-01-12T15:30:00"
  }
];
