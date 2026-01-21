
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { 
  User, Search, Gift, Send, Coins, Percent, ShoppingCart, 
  CreditCard, DollarSign, Tag, Package, Loader2, Home, CheckCircle, Clock,
  ListPlus, Trash2, ShoppingBag, QrCode
} from 'lucide-react';
import { Tourist } from '@/api/entities';
import { BusinessTransaction } from '@/api/entities';
import { LoyaltyRule } from '@/api/entities';
import { Business } from '@/api/entities';
import { Product } from '@/api/entities';
import BackButton from '@/components/ui/BackButton';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BusinessPointOfSale() {
  const [businessId, setBusinessId] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [touristCode, setTouristCode] = useState('');
  const [foundTourist, setFoundTourist] = useState(null);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loyaltyRules, setLoyaltyRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTermProducts, setSearchTermProducts] = useState("");
  const [cart, setCart] = useState([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true); // Novo estado

  useEffect(() => {
    const fetchBusinessData = async () => {
      setIsLoadingInitialData(true); // Inicia carregamento
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
          toast({ title: "Erro", description: "Usuário não logado.", variant: "destructive" });
          setIsLoadingInitialData(false);
          return;
        }
        const currentUser = JSON.parse(currentUserStr);
        if (!currentUser.business_id) {
          toast({ title: "Erro", description: "Nenhum comércio associado a este usuário.", variant: "destructive" });
          setIsLoadingInitialData(false);
          return;
        }
        
        setBusinessId(currentUser.business_id);
        
        const [businessData, rulesData, productsData] = await Promise.all([
          Business.get(currentUser.business_id),
          LoyaltyRule.filter({ business_id: currentUser.business_id, is_active: true }),
          Product.filter({ business_id: currentUser.business_id, is_available: true })
        ]);

        setBusinessName(businessData?.business_name || "Meu Comércio");
        setLoyaltyRules(rulesData || []);
        setProducts(productsData || []);

      } catch (error) {
        console.error("Erro ao carregar dados iniciais do PDV:", error);
        toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar informações do comércio, regras ou produtos.", variant: "destructive" });
      } finally {
        setIsLoadingInitialData(false); // Finaliza carregamento
      }
    };

    fetchBusinessData();
  }, []);
  
  const handleSearchTourist = async () => {
    if (!touristCode.trim()) {
      toast({ title: "Atenção", description: "Informe o código do turista para buscar.", variant: "warning" });
      return;
    }
    
    setIsSearching(true);
    setFoundTourist(null);
    
    try {
      // Buscar por código ou email
      const tourists = await Tourist.list();
      const found = tourists.find(t => 
        t.user_code?.toLowerCase() === touristCode.toLowerCase() || 
        t.email?.toLowerCase() === touristCode.toLowerCase()
      );
      
      if (found) {
        setFoundTourist(found);
      } else {
        toast({ title: "Não encontrado", description: "Turista não encontrado com este código.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Erro ao buscar turista:", error);
      toast({ title: "Erro", description: "Erro ao buscar turista. Tente novamente.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const calculateBenefits = (value, tourist) => {
    let pointsEarned = 0;
    let cashbackEarned = 0;

    loyaltyRules.forEach(rule => {
        if (rule.rule_type === 'points_per_purchase') {
            pointsEarned += Math.floor(value * rule.value);
        } else if (rule.rule_type === 'cashback_percentage') {
            cashbackEarned += value * rule.value;
        }
    });

    return { pointsEarned, cashbackEarned };
  };

  const handleConfirmPurchase = async () => {
    if (!foundTourist) {
      toast({ title: "Atenção", description: "Busque e selecione um turista primeiro.", variant: "warning" });
      return;
    }

    if (!businessId) {
      toast({ title: "Erro", description: "ID do comércio não definido.", variant: "destructive" });
      return;
    }

    const purchaseAmount = parseFloat(purchaseValue) || totalCartValue;
    if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
      toast({ title: "Atenção", description: "Insira um valor de compra válido.", variant: "warning" });
      return;
    }

    setIsProcessing(true);
    try {
      const { pointsEarned, cashbackEarned } = calculateBenefits(purchaseAmount, foundTourist);

      let transactionLog = [];

      // Processar cashback se aplicável
      if (cashbackEarned > 0) {
        await BusinessTransaction.create({
          business_id: businessId,
          tourist_id: foundTourist.id,
          transaction_type: 'earn_cashback',
          cashback_amount: cashbackEarned,
          description: `Cashback (${(cashbackEarned/purchaseAmount*100).toFixed(1)}%) em compra de R$${purchaseAmount.toFixed(2)}`,
          original_purchase_value: purchaseAmount
        });

        // Atualizar saldo do turista
        await Tourist.update(foundTourist.id, {
          cashback_balance: (foundTourist.cashback_balance || 0) + cashbackEarned
        });

        transactionLog.push(`+R$${cashbackEarned.toFixed(2)} cashback`);
      }

      // Processar pontos se aplicável
      if (pointsEarned > 0) {
        await BusinessTransaction.create({
          business_id: businessId,
          tourist_id: foundTourist.id,
          transaction_type: 'earn_points',
          points_amount: pointsEarned,
          description: `${pointsEarned} pontos em compra de R$${purchaseAmount.toFixed(2)}`,
          original_purchase_value: purchaseAmount
        });

        // Atualizar saldo do turista
        await Tourist.update(foundTourist.id, {
          points_balance: (foundTourist.points_balance || 0) + pointsEarned
        });

        transactionLog.push(`+${pointsEarned} pontos`);
      }

      // Limpar formulário e estado
      setFoundTourist(null);
      setTouristCode('');
      setPurchaseValue('');
      setCart([]);

      // Mostrar mensagem de sucesso
      toast({
        title: "Benefícios Creditados!",
        description: `${foundTourist.name || "Turista"} recebeu: ${transactionLog.join(' e ')}`,
        variant: "success"
      });

    } catch (error) {
      console.error("Erro ao processar benefícios:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar os benefícios.",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };

  const handleAddProductToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveProductFromCart = (productId) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.id === productId);
      if (!itemToRemove) return prevCart;

      if (itemToRemove.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter(item => item.id !== productId);
      }
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTermProducts.toLowerCase())
  );

  const totalCartValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoadingInitialData) { // Mostrar loading enquanto dados iniciais são carregados
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-lg text-gray-700">Carregando Ponto de Venda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Coluna de Produtos e Carrinho (Esquerda) */}
      <div className="w-full md:w-3/5 p-4 md:p-6 space-y-6">
        <BackButton />
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ShoppingCart className="mr-2 h-6 w-6 text-blue-600" />
              Registrar Venda
            </CardTitle>
            <CardDescription>Selecione produtos ou insira o valor total da compra.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Seção de Produtos */}
            <div className="mb-6">
              <Label htmlFor="search-product" className="text-sm font-medium text-gray-700">Buscar Produto</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="search-product"
                  type="text"
                  placeholder="Nome do produto..."
                  className="pl-10"
                  value={searchTermProducts}
                  onChange={(e) => setSearchTermProducts(e.target.value)}
                />
              </div>
              {products.length > 0 ? (
                <ScrollArea className="h-64 mt-3 border border-gray-200 rounded-md p-2">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-3 flex flex-col h-full">
                            <div className="flex items-center mb-2">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                  <ListPlus className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-medium text-sm text-gray-800 line-clamp-1">{product.name}</h4>
                                <p className="text-xs text-gray-500">{product.category}</p>
                              </div>
                            </div>
                            <p className="text-lg font-semibold text-blue-600 mt-auto mb-2">
                              R$ {product.price?.toFixed(2).replace('.', ',')}
                            </p>
                            <Button size="sm" variant="outline" onClick={() => handleAddProductToCart(product)} className="w-full">
                              Adicionar ao Carrinho
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">Nenhum produto encontrado com "{searchTermProducts}".</p>
                  )}
                </ScrollArea>
              ) : (
                 <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Nenhum produto cadastrado.</p>
                    <p className="text-xs text-gray-500 mt-1">Cadastre seus produtos para selecioná-los aqui.</p>
                </div>
              )}
            </div>

            {/* Seção de Carrinho */}
            {cart.length > 0 && (
              <div className="mb-6 p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Carrinho</h3>
                  <Button variant="ghost" size="sm" onClick={handleClearCart} className="text-red-500 hover:text-red-700">
                    Limpar Carrinho
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <p className="text-sm font-medium">{item.name} (x{item.quantity})</p>
                        <p className="text-xs text-gray-500">R$ {item.price?.toFixed(2).replace('.', ',')} cada</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleRemoveProductFromCart(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t">
                  <p className="text-lg font-bold text-right">Total: R$ {totalCartValue.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
            )}
             {/* OU Insira o Valor da Compra Manualmente */}
             <div className="my-6 text-center">
              <p className="text-sm text-gray-500">OU</p>
            </div>
            <div>
              <Label htmlFor="purchaseValue" className="text-sm font-medium text-gray-700">Valor Total da Compra (Manual)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="purchaseValue"
                  type="number"
                  placeholder="0.00"
                  className="pl-10 text-lg"
                  value={purchaseValue}
                  onChange={(e) => setPurchaseValue(e.target.value)}
                  disabled={cart.length > 0}
                />
              </div>
              {cart.length > 0 && <p className="text-xs text-orange-500 mt-1">O valor do carrinho será usado. Limpe o carrinho para inserir manualmente.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna de Turista e Confirmação (Direita) */}
      <div className="w-full md:w-2/5 p-4 md:p-6 bg-white md:min-h-screen md:sticky md:top-0">
        <Card className="shadow-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <User className="mr-2 h-6 w-6 text-purple-600" />
              Cliente Fidelidade
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div>
              <Label htmlFor="touristCode" className="text-sm font-medium text-gray-700">Código do Turista (Cartão ou App)</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative flex-grow">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                    <Input
                        id="touristCode"
                        placeholder="Insira o código ou escaneie"
                        value={touristCode}
                        onChange={(e) => setTouristCode(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={handleSearchTourist} disabled={isSearching || !touristCode} className="bg-purple-600 hover:bg-purple-700">
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {foundTourist && (
              <Card className="bg-purple-50 border-purple-200 p-4">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg text-purple-800">{foundTourist.name}</CardTitle>
                  <CardDescription className="text-purple-600">ID: {foundTourist.user_code}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-1 text-sm">
                  <p><strong>Pontos Atuais:</strong> {foundTourist.points_balance || 0}</p>
                  <p><strong>Cashback Atual:</strong> R$ {(foundTourist.cashback_balance || 0).toFixed(2).replace('.', ',')}</p>
                </CardContent>
              </Card>
            )}

            {(totalCartValue > 0 || parseFloat(purchaseValue) > 0) && foundTourist && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Resumo da Recompensa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Valor da Compra:</strong> R$ {(totalCartValue || parseFloat(purchaseValue) || 0).toFixed(2).replace('.', ',')}</p>
                  <div className="text-green-700 font-medium">
                    <p>+{calculateBenefits(totalCartValue || parseFloat(purchaseValue) || 0, foundTourist).pointsEarned} Pontos</p>
                    <p>+R$ {calculateBenefits(totalCartValue || parseFloat(purchaseValue) || 0, foundTourist).cashbackEarned.toFixed(2).replace('.', ',')} Cashback</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button
              onClick={handleConfirmPurchase}
              disabled={isProcessing || !foundTourist || !(totalCartValue > 0 || parseFloat(purchaseValue) > 0)}
              className="w-full text-lg py-3 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Gift className="mr-2 h-6 w-6" />
              )}
              Confirmar e Creditar Benefícios
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
