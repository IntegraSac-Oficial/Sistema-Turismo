import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicHeader({ siteConfig }) {
  return (
    <div className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to={createPageUrl("Public")}>
              <img
                src={siteConfig?.aparencia?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/logo-sc.png"}
                alt={siteConfig?.geral?.site_name || "Praias Catarinenses"}
                className="h-10"
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-500 text-white"
              asChild
            >
              <Link to={createPageUrl("Cadastro")}>
                <Building2 className="h-4 w-4 mr-2" />
                Cadastrar Comércio
              </Link>
            </Button>
            
            <Button 
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
              asChild
            >
              <Link to={createPageUrl("RealtorSignup")}>
                <Home className="h-4 w-4 mr-2" />
                Cadastrar Imobiliária
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}