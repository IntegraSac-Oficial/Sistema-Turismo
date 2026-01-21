
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Product } from "@/api/entities";
import { Business } from "@/api/entities";
import { User } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { stripeIntegration } from "@/api/functions";
import { 
  ArrowLeft, 
  CreditCard, 
  Minus, 
  Plus, 
  ShoppingCart, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import PixPaymentModal from "@/components/payment/PixPaymentModal";
import StripeModal from "@/components/payment/StripeModal";

export default function ProductCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [business, setBusiness] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [hasErrors, setHasErrors] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const productId = urlParams.get('product_id');
  const successParam = urlParams.get('success');
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Verificar se veio de um checkout concluído
        if (successParam === "true" && sessionId) {
          setOrderSuccess(true);
          // Aqui poderia registrar a conclusão da transação
        }
        
        // Carregar dados do produto
        if (productId) {
          const product = await Product.get(productId);
          setSelectedProduct(product);
          
          // Carregar dados do negócio com retry em caso de falha
          let retries = 0;
          const maxRetries = 3;
          let businessData = null;
          
          while (retries < maxRetries && !businessData) {
            try {
              console.log(`Tentativa ${retries + 1} de carregar dados do negócio...`);
              businessData = await Business.get(product.business_id);
              
              // Verificar se tem as configurações de pagamento
              if (!businessData.payment_settings || !businessData.payment_settings.bank_info) {
                console.log("Configurações de pagamento incompletas, aplicando configuração padrão...");
                // Aplicar configuração padrão
                businessData.payment_settings = {
                  ...businessData.payment_settings || {},
                  payment_methods: {
                    credit_card: false,
                    pix: false,
                    cash: true
                  },
                  bank_info: {
                    bank_name: "",
                    account_type: "",
                    account_number: "",
                    agency: "",
                    pix_key: businessData.payment_settings?.bank_info?.pix_key || "",
                    pix_key_type: businessData.payment_settings?.bank_info?.pix_key_type || "CPF"
                  }
                };
              }
              
              setBusiness(businessData);
              
              // Definir método de pagamento padrão baseado na configuração
              if (businessData.payment_settings?.payment_methods) {
                const methods = businessData.payment_settings.payment_methods;
                if (methods.credit_card) {
                  setPaymentMethod("credit_card");
                } else if (methods.pix) {
                  setPaymentMethod("pix");
                } else {
                  setPaymentMethod("cash");
                }
              }
              
              break;
            } catch (error) {
              console.error(`Erro ao carregar dados do negócio (tentativa ${retries + 1}):`, error);
              retries++;
              if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        }
        
        // Verificar usuário logado
        try {
          const userData = await User.me();
          setCurrentUser(userData);
          
          // Preencher formulário com dados do usuário
          setUserInfo({
            name: userData.full_name || "",
            email: userData.email || "",
            phone: "",
            address: ""
          });
        } catch (error) {
          console.log("Usuário não logado");
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do produto",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [productId, successParam, sessionId]);
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncreaseQuantity = () => {
    if (quantity < 20) {  // Limite arbitrário
      setQuantity(quantity + 1);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };
  
  const validateForm = () => {
    const requiredFields = ["name", "email", "phone"];
    const missingFields = requiredFields.filter(field => !userInfo[field]);
    
    if (missingFields.length > 0) {
      const fieldNames = {
        name: "Nome completo",
        email: "Email",
        phone: "Telefone"
      };
      
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha os seguintes campos: ${missingFields.map(f => fieldNames[f]).join(", ")}`,
        variant: "destructive"
      });
      
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Processar pagamento com base no método selecionado
    if (paymentMethod === "credit_card") {
      handleStripePayment();
    } else if (paymentMethod === "pix") {
      handlePixPayment();
    }
  };
  
  const handleStripePayment = async () => {
    try {
      setIsLoading(true);
      
      console.log("Iniciando pagamento com Stripe...", {
        amount: totalValue,
        product_id: selectedProduct.id,
        business_id: selectedProduct.business_id,
        customer_info: {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone
        }
      });

      // Integração com Stripe via função backend
      const response = await stripeIntegration({
        amount: totalValue,
        product_id: selectedProduct.id,
        business_id: selectedProduct.business_id,
        customer_info: {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone
        }
      });

      console.log("Resposta do Stripe:", response);

      if (response.data?.url || response.url) {
        // Redirecionar para página de checkout do Stripe
        const checkoutUrl = response.data?.url || response.url;
        console.log("Redirecionando para:", checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        throw new Error("URL de checkout não retornada");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar seu pagamento com cartão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePixPayment = () => {
    console.log("Abrindo modal PIX com dados:", {
      pixKey: business?.payment_settings?.bank_info?.pix_key,
      pixKeyType: business?.payment_settings?.bank_info?.pix_key_type,
      amount: totalValue,
      businessName: business?.business_name
    });
    
    setIsPixModalOpen(true);
  };
  
  const totalValue = selectedProduct?.price * quantity;
  
  // Verificar se há informações de PIX configuradas
  const hasPixConfig = business?.payment_settings?.bank_info?.pix_key;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Pagamento Concluído!</h1>
            <p className="text-gray-600 mb-8">
              Seu pedido foi processado com sucesso. Agradecemos a sua compra!
            </p>
            <Button onClick={() => navigate(createPageUrl("Public"))}>
              Voltar para a página inicial
            </Button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }
  
  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <p className="text-gray-600 mb-8">
              O produto que você está procurando não está disponível.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Finalizar Compra
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 border-b pb-6 mb-6">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden">
                    {selectedProduct?.image_url ? (
                      <img 
                        src={selectedProduct.image_url} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium text-lg">{selectedProduct?.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{selectedProduct?.description}</p>
                    <p className="text-lg font-semibold text-blue-600">R$ {selectedProduct?.price?.toFixed(2)}</p>
                    
                    <div className="mt-3 flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleDecreaseQuantity}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-4 font-medium">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleIncreaseQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Informações para Entrega</h3>
                  
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name">Nome completo</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={userInfo.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={userInfo.email}
                          onChange={handleInputChange}
                          placeholder="Seu email para contato"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={userInfo.phone}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Resumo do Pedido</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>R$ {(selectedProduct?.price * quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>R$ {totalValue?.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3">Forma de Pagamento</h4>
                  
                  {/* Mostrar opções baseadas no que o negócio aceita */}
                  <div className="space-y-3">
                    {business?.payment_settings?.payment_methods?.pix && (
                      <div 
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'pix' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('pix')}
                      >
                        <div className="flex justify-center items-center h-5 w-5 rounded-full border border-gray-300">
                          {paymentMethod === 'pix' && (
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <div className="font-medium">PIX</div>
                        <div className="ml-auto text-sm text-gray-500">Pagamento instantâneo</div>
                      </div>
                    )}
                    
                    {business?.payment_settings?.payment_methods?.credit_card && (
                      <div 
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('credit_card')}
                      >
                        <div className="flex justify-center items-center h-5 w-5 rounded-full border border-gray-300">
                          {paymentMethod === 'credit_card' && (
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <div className="font-medium">Cartão de Crédito</div>
                        <div className="ml-auto text-sm text-gray-500">Visa, Mastercard, etc</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="w-4 h-4 border border-gray-300 rounded mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-600">Pagamento seguro e criptografado</span>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium"
                  disabled={isLoading || !paymentMethod || hasErrors}
                  onClick={() => {
                    if (paymentMethod === 'pix') {
                      handlePixPayment();
                    } else if (paymentMethod === 'credit_card') {
                      handleStripePayment();
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin mr-2" />
                      Processando...
                    </div>
                  ) : (
                    <>Finalizar Compra</>
                  )}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Ao finalizar a compra, você concorda com os Termos de Uso e Política de Privacidade do site.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Modal PIX */}
      {isPixModalOpen && (
        <PixPaymentModal
          isOpen={isPixModalOpen}
          onClose={() => setIsPixModalOpen(false)}
          pixKey={business?.payment_settings?.bank_info?.pix_key}
          pixKeyType={business?.payment_settings?.bank_info?.pix_key_type}
          amount={totalValue}
          businessName={business?.business_name}
        />
      )}
      
      <PublicFooter />
    </div>
  );
}
