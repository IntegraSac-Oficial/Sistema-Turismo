import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

export function PublicFooter({ siteConfig }) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Sobre */}
          <div>
            {siteConfig?.aparencia?.logo_url ? (
              <img 
                src={siteConfig.aparencia.logo_url} 
                alt={siteConfig?.geral?.site_name || "Praias Catarinenses"} 
                className="h-12 mb-4"
              />
            ) : (
              <h3 className="text-2xl font-bold mb-4">{siteConfig?.geral?.site_name || "Praias Catarinenses"}</h3>
            )}
            <p className="text-gray-400 mb-4">
              Descubra as mais belas praias de Santa Catarina e aproveite descontos exclusivos com nosso cartão de turista.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to={createPageUrl("PublicCities")} className="text-gray-400 hover:text-white">
                  Cidades
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("PublicBeaches")} className="text-gray-400 hover:text-white">
                  Praias
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("PublicBusinesses")} className="text-gray-400 hover:text-white">
                  Comércios
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Events")} className="text-gray-400 hover:text-white">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Community")} className="text-gray-400 hover:text-white">
                  Comunidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              {siteConfig?.geral?.contact_email ? (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-[#FF5722] mr-2" />
                  <a href={`mailto:${siteConfig.geral.contact_email}`} className="text-gray-400 hover:text-white">
                    {siteConfig.geral.contact_email}
                  </a>
                </li>
              ) : (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-[#FF5722] mr-2" />
                  <a href="mailto:contato@praiascatarinenses.com" className="text-gray-400 hover:text-white">
                    contato@praiascatarinenses.com
                  </a>
                </li>
              )}
              
              {siteConfig?.geral?.contact_phone ? (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-[#FF5722] mr-2" />
                  <a href={`tel:${siteConfig.geral.contact_phone}`} className="text-gray-400 hover:text-white">
                    {siteConfig.geral.contact_phone}
                  </a>
                </li>
              ) : (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-[#FF5722] mr-2" />
                  <a href="tel:(48) 99999-9999" className="text-gray-400 hover:text-white">
                    (48) 99999-9999
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
            <div className="flex space-x-4">
              {siteConfig?.redes_sociais?.facebook && (
                <a 
                  href={siteConfig.redes_sociais.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {siteConfig?.redes_sociais?.instagram && (
                <a 
                  href={siteConfig.redes_sociais.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {siteConfig?.redes_sociais?.twitter && (
                <a 
                  href={siteConfig.redes_sociais.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {siteConfig?.redes_sociais?.linkedin && (
                <a 
                  href={siteConfig.redes_sociais.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {siteConfig?.redes_sociais?.youtube && (
                <a 
                  href={siteConfig.redes_sociais.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Youtube className="h-6 w-6" />
                </a>
              )}
              
              {/* Se não houver redes sociais configuradas, exibir ícones padrão */}
              {!siteConfig?.redes_sociais?.facebook && 
               !siteConfig?.redes_sociais?.instagram && 
               !siteConfig?.redes_sociais?.twitter && 
               !siteConfig?.redes_sociais?.linkedin && 
               !siteConfig?.redes_sociais?.youtube && (
                <>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Twitter className="h-6 w-6" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>{siteConfig?.geral?.footer_copyright || "© 2023 Praias Catarinenses. Todos os direitos reservados."}</p>
        </div>
      </div>
    </footer>
  );
}