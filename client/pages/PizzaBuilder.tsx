import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pizza, 
  ArrowLeft, 
  ArrowRight, 
  ShoppingCart, 
  Plus, 
  Minus,
  ChefHat,
  Clock,
  Star
} from "lucide-react";

interface IngredientOption {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  popular?: boolean;
}

interface PizzaStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface CustomPizza {
  base?: IngredientOption;
  sauce?: IngredientOption;
  cheese?: IngredientOption;
  vegetables: IngredientOption[];
  meat: IngredientOption[];
  size: 'small' | 'medium' | 'large';
  quantity: number;
}

export default function PizzaBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [pizza, setPizza] = useState<CustomPizza>({
    vegetables: [],
    meat: [],
    size: 'medium',
    quantity: 1
  });

  const steps: PizzaStep[] = [
    { id: 1, title: "Choose Base", description: "Select your pizza base", completed: !!pizza.base },
    { id: 2, title: "Pick Sauce", description: "Choose your sauce", completed: !!pizza.sauce },
    { id: 3, title: "Select Cheese", description: "Pick your cheese", completed: !!pizza.cheese },
    { id: 4, title: "Add Veggies", description: "Choose vegetables", completed: pizza.vegetables.length > 0 },
    { id: 5, title: "Add Meat", description: "Optional meat toppings", completed: true }, // Optional step
    { id: 6, title: "Size & Quantity", description: "Finalize your order", completed: true }
  ];

  // Mock data - in real app, fetch from API
  const bases: IngredientOption[] = [
    { id: "1", name: "Classic Thin Crust", description: "Light, crispy, and traditional", price: 0, popular: true },
    { id: "2", name: "Thick Crust", description: "Fluffy and filling base", price: 150 },
    { id: "3", name: "Stuffed Crust", description: "Cheese-filled crust edges", price: 300, popular: true },
    { id: "4", name: "Gluten-Free", description: "Made with alternative flour", price: 200 },
    { id: "5", name: "Whole Wheat", description: "Healthy whole grain option", price: 80 }
  ];

  const sauces: IngredientOption[] = [
    { id: "1", name: "Classic Tomato", description: "Traditional pizza sauce", price: 0, popular: true },
    { id: "2", name: "BBQ Sauce", description: "Sweet and tangy BBQ", price: 80 },
    { id: "3", name: "White Sauce", description: "Creamy garlic alfredo", price: 120, popular: true },
    { id: "4", name: "Pesto", description: "Fresh basil pesto", price: 150 },
    { id: "5", name: "Buffalo Sauce", description: "Spicy buffalo wing sauce", price: 120 }
  ];

  const cheeses: IngredientOption[] = [
    { id: "1", name: "Mozzarella", description: "Classic stretchy cheese", price: 0, popular: true },
    { id: "2", name: "Cheddar", description: "Sharp and flavorful", price: 80 },
    { id: "3", name: "Parmesan", description: "Aged and nutty", price: 150 },
    { id: "4", name: "Four Cheese Blend", description: "Mozzarella, cheddar, parmesan, provolone", price: 250, popular: true },
    { id: "5", name: "Vegan Cheese", description: "Plant-based alternative", price: 180 }
  ];

  const vegetables: IngredientOption[] = [
    { id: "1", name: "Mushrooms", description: "Fresh button mushrooms", price: 80, popular: true },
    { id: "2", name: "Bell Peppers", description: "Colorful bell peppers", price: 70 },
    { id: "3", name: "Red Onions", description: "Sweet red onions", price: 40 },
    { id: "4", name: "Black Olives", description: "Mediterranean olives", price: 120 },
    { id: "5", name: "Tomatoes", description: "Fresh cherry tomatoes", price: 60, popular: true },
    { id: "6", name: "Spinach", description: "Fresh baby spinach", price: 80 },
    { id: "7", name: "Jalapeños", description: "Spicy jalapeño peppers", price: 90 },
    { id: "8", name: "Corn", description: "Sweet corn kernels", price: 50 }
  ];

  const meats: IngredientOption[] = [
    { id: "1", name: "Pepperoni", description: "Classic spicy pepperoni", price: 150, popular: true },
    { id: "2", name: "Italian Sausage", description: "Seasoned pork sausage", price: 200 },
    { id: "3", name: "Grilled Chicken", description: "Tender grilled chicken", price: 250, popular: true },
    { id: "4", name: "Ham", description: "Smoked ham slices", price: 180 },
    { id: "5", name: "Bacon", description: "Crispy bacon strips", price: 220 },
    { id: "6", name: "Ground Beef", description: "Seasoned ground beef", price: 200 }
  ];

  const sizeMultipliers = {
    small: { multiplier: 0.8, label: "Small (10\")", description: "Perfect for 1-2 people" },
    medium: { multiplier: 1, label: "Medium (12\")", description: "Great for 2-3 people" },
    large: { multiplier: 1.3, label: "Large (14\")", description: "Ideal for 3-4 people" }
  };

  const calculatePrice = () => {
    const basePrice = 899; // Base pizza price in INR
    let totalPrice = basePrice;
    
    if (pizza.base) totalPrice += pizza.base.price;
    if (pizza.sauce) totalPrice += pizza.sauce.price;
    if (pizza.cheese) totalPrice += pizza.cheese.price;
    
    pizza.vegetables.forEach(veg => totalPrice += veg.price);
    pizza.meat.forEach(meat => totalPrice += meat.price);
    
    totalPrice *= sizeMultipliers[pizza.size].multiplier;
    totalPrice *= pizza.quantity;
    
    return totalPrice.toFixed(2);
  };

  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!pizza.base;
      case 2: return !!pizza.sauce;
      case 3: return !!pizza.cheese;
      case 4: return pizza.vegetables.length > 0;
      case 5: return true; // Meat is optional
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleVegetable = (vegetable: IngredientOption) => {
    setPizza(prev => ({
      ...prev,
      vegetables: prev.vegetables.some(v => v.id === vegetable.id)
        ? prev.vegetables.filter(v => v.id !== vegetable.id)
        : [...prev.vegetables, vegetable]
    }));
  };

  const toggleMeat = (meat: IngredientOption) => {
    setPizza(prev => ({
      ...prev,
      meat: prev.meat.some(m => m.id === meat.id)
        ? prev.meat.filter(m => m.id !== meat.id)
        : [...prev.meat, meat]
    }));
  };

  const addToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', pizza);
    navigate('/checkout');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Choose Your Pizza Base</h3>
            <RadioGroup
              value={pizza.base?.id || ""}
              onValueChange={(value) => {
                const selectedBase = bases.find(b => b.id === value);
                if (selectedBase) setPizza(prev => ({ ...prev, base: selectedBase }));
              }}
            >
              <div className="grid gap-4">
                {bases.map((base) => (
                  <div key={base.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={base.id} id={base.id} />
                    <Label htmlFor={base.id} className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{base.name}</h4>
                              {base.popular && (
                                <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{base.description}</p>
                          </div>
                          <span className="font-semibold">
                            {base.price === 0 ? 'Free' : `+₹${base.price}`}
                          </span>
                        </div>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Pick Your Sauce</h3>
            <RadioGroup
              value={pizza.sauce?.id || ""}
              onValueChange={(value) => {
                const selectedSauce = sauces.find(s => s.id === value);
                if (selectedSauce) setPizza(prev => ({ ...prev, sauce: selectedSauce }));
              }}
            >
              <div className="grid gap-4">
                {sauces.map((sauce) => (
                  <div key={sauce.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={sauce.id} id={sauce.id} />
                    <Label htmlFor={sauce.id} className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{sauce.name}</h4>
                              {sauce.popular && (
                                <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{sauce.description}</p>
                          </div>
                          <span className="font-semibold">
                            {sauce.price === 0 ? 'Free' : `+₹${sauce.price}`}
                          </span>
                        </div>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Select Your Cheese</h3>
            <RadioGroup
              value={pizza.cheese?.id || ""}
              onValueChange={(value) => {
                const selectedCheese = cheeses.find(c => c.id === value);
                if (selectedCheese) setPizza(prev => ({ ...prev, cheese: selectedCheese }));
              }}
            >
              <div className="grid gap-4">
                {cheeses.map((cheese) => (
                  <div key={cheese.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={cheese.id} id={cheese.id} />
                    <Label htmlFor={cheese.id} className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{cheese.name}</h4>
                              {cheese.popular && (
                                <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{cheese.description}</p>
                          </div>
                          <span className="font-semibold">
                            {cheese.price === 0 ? 'Free' : `+₹${cheese.price}`}
                          </span>
                        </div>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Add Vegetables</h3>
            <p className="text-muted-foreground mb-4">Select multiple vegetables for your pizza</p>
            <div className="grid gap-4">
              {vegetables.map((vegetable) => (
                <div key={vegetable.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={vegetable.id}
                    checked={pizza.vegetables.some(v => v.id === vegetable.id)}
                    onCheckedChange={() => toggleVegetable(vegetable)}
                  />
                  <Label htmlFor={vegetable.id} className="flex-1 cursor-pointer">
                    <Card className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{vegetable.name}</h4>
                            {vegetable.popular && (
                              <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{vegetable.description}</p>
                        </div>
                        <span className="font-semibold">+₹{vegetable.price}</span>
                      </div>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Add Meat (Optional)</h3>
            <p className="text-muted-foreground mb-4">Select meat toppings for your pizza</p>
            <div className="grid gap-4">
              {meats.map((meat) => (
                <div key={meat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={meat.id}
                    checked={pizza.meat.some(m => m.id === meat.id)}
                    onCheckedChange={() => toggleMeat(meat)}
                  />
                  <Label htmlFor={meat.id} className="flex-1 cursor-pointer">
                    <Card className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{meat.name}</h4>
                            {meat.popular && (
                              <Badge variant="secondary" className="bg-pizza-orange/10 text-pizza-red">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{meat.description}</p>
                        </div>
                        <span className="font-semibold">+₹{meat.price}</span>
                      </div>
                    </Card>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Size & Quantity</h3>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Choose Size</Label>
                <RadioGroup
                  value={pizza.size}
                  onValueChange={(value: 'small' | 'medium' | 'large') => 
                    setPizza(prev => ({ ...prev, size: value }))
                  }
                  className="mt-3"
                >
                  {Object.entries(sizeMultipliers).map(([size, info]) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem value={size} id={size} />
                      <Label htmlFor={size} className="flex-1 cursor-pointer">
                        <Card className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{info.label}</h4>
                              <p className="text-sm text-muted-foreground">{info.description}</p>
                            </div>
                            <span className="font-semibold">
                              {size === 'medium' ? 'Standard' : 
                               size === 'small' ? '-20%' : '+30%'}
                            </span>
                          </div>
                        </Card>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Quantity</Label>
                <div className="flex items-center space-x-4 mt-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPizza(prev => ({ 
                      ...prev, 
                      quantity: Math.max(1, prev.quantity - 1) 
                    }))}
                    disabled={pizza.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{pizza.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPizza(prev => ({ 
                      ...prev, 
                      quantity: prev.quantity + 1 
                    }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Build Your Perfect Pizza</h1>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step indicators */}
              <div className="flex justify-between mt-4">
                {steps.map((step) => (
                  <div key={step.id} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.id === currentStep ? 'bg-primary text-primary-foreground' :
                      step.id < currentStep ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {step.id < currentStep ? '✓' : step.id}
                    </div>
                    <div className="text-xs mt-1 max-w-20 hidden sm:block">
                      {step.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <Card>
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={addToCart} className="pizza-gradient">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart - ₹{calculatePrice()}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Pizza Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Your Pizza
                </CardTitle>
                <CardDescription>Custom creation summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pizza visualization */}
                <div className="aspect-square bg-gradient-to-br from-pizza-cream to-pizza-orange/20 rounded-lg flex items-center justify-center text-6xl">
                  🍕
                </div>
                
                <div className="space-y-3">
                  {pizza.base && (
                    <div className="flex justify-between">
                      <span className="text-sm">Base: {pizza.base.name}</span>
                      <span className="text-sm">₹{pizza.base.price}</span>
                    </div>
                  )}
                  
                  {pizza.sauce && (
                    <div className="flex justify-between">
                      <span className="text-sm">Sauce: {pizza.sauce.name}</span>
                      <span className="text-sm">₹{pizza.sauce.price}</span>
                    </div>
                  )}
                  
                  {pizza.cheese && (
                    <div className="flex justify-between">
                      <span className="text-sm">Cheese: {pizza.cheese.name}</span>
                      <span className="text-sm">₹{pizza.cheese.price}</span>
                    </div>
                  )}
                  
                  {pizza.vegetables.length > 0 && (
                    <div>
                      <div className="text-sm font-medium">Vegetables:</div>
                      {pizza.vegetables.map(veg => (
                        <div key={veg.id} className="flex justify-between ml-2">
                          <span className="text-sm">• {veg.name}</span>
                          <span className="text-sm">₹{veg.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {pizza.meat.length > 0 && (
                    <div>
                      <div className="text-sm font-medium">Meat:</div>
                      {pizza.meat.map(meat => (
                        <div key={meat.id} className="flex justify-between ml-2">
                          <span className="text-sm">• {meat.name}</span>
                          <span className="text-sm">₹{meat.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Size: {sizeMultipliers[pizza.size].label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quantity: {pizza.quantity}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">₹{calculatePrice()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Ready in 15-20 mins</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
