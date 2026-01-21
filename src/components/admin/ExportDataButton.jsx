import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { exportDatabaseData } from "@/api/functions";

export default function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const response = await exportDatabaseData();
      
      if (!response.ok) {
        // Primeiro, tente obter um erro JSON
        let errorMessage = 'Falha na exportação';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (e) {
          // Se não for JSON, tente obter como texto
          try {
            errorMessage = await response.text();
          } catch (textError) {
            // Se não conseguir nem como texto, use a mensagem genérica
            console.error("Erro ao ler resposta:", textError);
          }
        }
        throw new Error(errorMessage);
      }
      
      // Criar link para download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database_export.sql';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast({
        title: "Sucesso!",
        description: "Dados exportados com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: error.message || "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar Banco de Dados
        </>
      )}
    </Button>
  );
}