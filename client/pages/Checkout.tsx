import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Pizza, 
  CreditCard, 
  Truck, 
  MapPin, 
  Clock, 
  ShieldCheck,
  ArrowLeft,
  Loader2
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  base: { name: string; price: number };
  sauce: { name: string; price: number };
  cheese: { name: string; price: number };
  vegetables: Array<{ name: string; price: number }>;
  meat: Array<{ name: string; price: number }>;
  size: 'small' | 'medium' | 'large';
  quantity: number;
  price: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Mock cart data - in real app, get from cart context/state
  const cartItems: CartItem[] = [
    {
      id: '1',
      name: 'Custom Margherita',
      base: { name: 'Classic Thin Crust', price: 0 },
      sauce: { name: 'Classic Tomato', price: 0 },
      cheese: { name: 'Mozzarella', price: 0 },
      vegetables: [
        { name: 'Tomatoes', price: 1 },
        { name: 'Mushrooms', price: 1 }
      ],
      meat: [],
      size: 'medium',
      quantity: 2,
      price: 1249
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = subtotal > 1999 ? 0 : 199;
  const total = subtotal + tax + deliveryFee;

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return deliveryAddress.street && 
           deliveryAddress.city && 
           deliveryAddress.state && 
           deliveryAddress.zipCode;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpayScript();
    
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // Create order on backend
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: total,
          currency: 'USD'
        })
      });

      const orderData = await response.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message);
      }

      // Configure Razorpay options
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'PizzaCraft',
        description: 'Fresh pizza delivered hot to your door',
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          // Payment successful, verify on backend
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  customerInfo: {
                    name: 'John Doe', // Get from user context
                    email: 'john@example.com',
                    phone: '+1234567890',
                    address: deliveryAddress
                  },
                  items: cartItems,
                  pricing: {
                    subtotal,
                    tax,
                    deliveryFee,
                    discount: 0,
                    total
                  }
                }
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              navigate(`/order-confirmation/${verifyData.data.orderNumber}`);
            } else {
              throw new Error(verifyData.message);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '+1234567890'
        },
        theme: {
          color: '#E85A4F'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customerInfo: {
            name: 'John Doe', // Get from user context
            email: 'john@example.com',
            phone: '+1234567890',
            address: deliveryAddress
          },
          items: cartItems,
          pricing: {
            subtotal,
            tax,
            deliveryFee,
            discount: 0,
            total
          },
          paymentMethod: 'cod',
          notes: specialInstructions
        })
      });

      const orderData = await response.json();
      
      if (orderData.success) {
        navigate(`/order-confirmation/${orderData.data.orderNumber}`);
      } else {
        throw new Error(orderData.message);
      }
    } catch (error) {
      console.error('COD order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      alert('Please fill in all delivery address fields');
      return;
    }

    setIsLoading(true);

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await handleCODOrder();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="pizza-gradient p-2 rounded-xl">
              <Pizza className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold pizza-text-gradient">PizzaCraft</span>
          </div>
          
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Checkout</h1>
              <p className="text-muted-foreground">Complete your order and get fresh pizza delivered</p>
            </div>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
                <CardDescription>Where should we deliver your pizza?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={deliveryAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="NY"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="10001"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
                <CardDescription>Any special requests for your order?</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., Extra crispy, Ring doorbell twice, Leave at door..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: 'razorpay' | 'cod') => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Pay Online</h4>
                            <p className="text-sm text-muted-foreground">
                              Credit/Debit Card, UPI, Net Banking
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            <Badge variant="secondary">Secure</Badge>
                          </div>
                        </div>
                      </Card>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Cash on Delivery</h4>
                            <p className="text-sm text-muted-foreground">
                              Pay when your pizza arrives
                            </p>
                          </div>
                          <Truck className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Card>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your pizza order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Size: {item.size.charAt(0).toUpperCase() + item.size.slice(1)}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Base: {item.base.name}</p>
                        <p>Sauce: {item.sauce.name}</p>
                        <p>Cheese: {item.cheese.name}</p>
                        {item.vegetables.length > 0 && (
                          <p>Vegetables: {item.vegetables.map(v => v.name).join(', ')}</p>
                        )}
                        {item.meat.length > 0 && (
                          <p>Meat: {item.meat.map(m => m.name).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(0)}`}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">Free delivery on orders over ₹1999!</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated delivery: 25-35 minutes</span>
                </div>

                <Button 
                  className="w-full pizza-gradient" 
                  size="lg" 
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'} - ₹{total.toFixed(0)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
