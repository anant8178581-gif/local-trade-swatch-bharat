import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Cell, 
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { 
  Utensils, 
  Upload, 
  Camera, 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  IndianRupee, 
  Plus, 
  Minus, 
  ShieldAlert, 
  Zap, 
  Heart, 
  Eye, 
  Building2, 
  Phone, 
  ChevronRight, 
  Check, 
  FileText, 
  Info, 
  X,
  Flame,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Clock,
  Trash2,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  Coffee,
  Sun,
  Moon,
  PlusCircle,
  Copy,
  FileSpreadsheet,
  Share2,
  Printer,
  Download,
  CheckCheck
} from 'lucide-react';
import { 
  geminiService, 
  MealNutritionAnalysis, 
  NutritionRecommendationItem,
  DietChartPlan,
  DietChartMealItem
} from '../services/geminiService';

export interface LoggedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'hydration';
  laborActivity?: string;
}

export const COMMON_MEAL_PRESETS = [
  { name: '4 Whole Wheat Roti + Yellow Dal Tadka', calories: 520, protein: 18, mealType: 'lunch' as const, icon: '🫓' },
  { name: 'Steamed Rice + Boiled Rajma / Chana Plate', calories: 580, protein: 17, mealType: 'lunch' as const, icon: '🍚' },
  { name: 'Double Boiled Egg Curry + 2 Roti', calories: 490, protein: 24, mealType: 'dinner' as const, icon: '🥚' },
  { name: 'Morning Sweet Masala Chai + 2 Aloo Parathas', calories: 540, protein: 13, mealType: 'breakfast' as const, icon: '☕' },
  { name: 'Midday 2 Potato Samosas + Sweet Chutney', calories: 380, protein: 6, mealType: 'snack' as const, icon: '🥟' },
  { name: 'Roasted Chana + Jaggery (Gud-Chana Energy Pack)', calories: 240, protein: 12, mealType: 'snack' as const, icon: '🥜' },
  { name: '2 Bananas + Electrolyte Shikanji / Nimbu Pani', calories: 210, protein: 2, mealType: 'hydration' as const, icon: '🍋' }
];

export const INITIAL_LOGGED_MEALS: LoggedMeal[] = [
  {
    id: 'log-1',
    name: 'Morning Sweet Chai & 2 Aloo Parathas',
    calories: 520,
    protein: 13,
    time: '08:15 AM',
    mealType: 'breakfast',
    laborActivity: 'Morning Site Setup & Tool Prep'
  },
  {
    id: 'log-2',
    name: 'Midday 4 Rotis, Toor Dal & Mixed Sabzi',
    calories: 780,
    protein: 21,
    time: '01:30 PM',
    mealType: 'lunch',
    laborActivity: 'Heavy Trench Digging & Masonry'
  },
  {
    id: 'log-3',
    name: 'Site Break: Gud-Chana & Sweet Tea',
    calories: 260,
    protein: 10,
    time: '04:45 PM',
    mealType: 'snack',
    laborActivity: 'Ladders & Heavy Pipe Fitting'
  }
];

interface WorkerNutritionScreenerProps {
  onSelectHealthcare?: (facilityId: string) => void;
  compactMode?: boolean;
  userMode?: 'worker' | 'customer';
  onOpenAIAssistant?: () => void;
}

// Preset meal options with high-quality Indian food images
const PRESET_MEALS = [
  {
    id: 'preset-1',
    label: 'Standard Thali',
    name: 'Classic Labor Thali (Toor Dal, Rice, 3 Roti, Aloo Sabzi)',
    hint: 'Classic standard Indian worker thali with yellow toor dal, white rice, 3 whole wheat rotis, and spiced aloo-gobhi sabzi',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
    tag: 'Carb-Heavy'
  },
  {
    id: 'preset-2',
    label: 'Egg Curry & Rice',
    name: 'Double Boiled Egg Curry & Rice Plate',
    hint: 'Double boiled egg curry with onion tomato gravy and steamed rice with onion cucumber salad',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    tag: 'Protein Base'
  },
  {
    id: 'preset-3',
    label: 'Moong Khichdi',
    name: 'Simple Moong Dal Khichdi & Achar Thali',
    hint: 'Moong dal khichdi with desi ghee, spicy mango pickle, and roasted papad',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    tag: 'Light Labor'
  },
  {
    id: 'preset-4',
    label: 'Samosa & Chai',
    name: 'Street Samosa & Masala Chai Fast Snack',
    hint: 'Two deep fried potato samosas with sweet chutney and one glass of sweet masala milk chai',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    tag: 'High Deficit'
  }
];

// Local Healthcare Facilities near Delhi 110091
const NEARBY_HEALTHCARE = [
  {
    id: 'h1',
    name: 'PM Jan Aushadhi Kendra (Govt. Generic Pharmacy)',
    distance: '0.4 km',
    address: 'Shop 12, Main Market, Mayur Vihar Phase-1, Delhi 110091',
    savings: '85% Cheaper: Iron-Folic Tablets @ ₹2.50 / strip',
    phone: '+91 11 2275 8890',
    type: 'Generic Pharmacy'
  },
  {
    id: 'h2',
    name: 'Aam Aadmi Mohalla Clinic & PHC',
    distance: '0.7 km',
    address: 'Near Pocket 1 Community Centre, Trilokpuri, Delhi 110091',
    savings: '100% Free: Hemoglobin & Blood Sugar Tests',
    phone: '+91 11 2271 4433',
    type: 'Primary Clinic'
  }
];

export const WorkerNutritionScreener: React.FC<WorkerNutritionScreenerProps> = ({
  onSelectHealthcare,
  compactMode = false,
  userMode = 'worker',
  onOpenAIAssistant
}) => {
  // State for image handling
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_MEALS[0].imageUrl);
  const [imageFileName, setImageFileName] = useState<string>('classic_worker_thali.jpg');
  const [imageFileSize, setImageFileSize] = useState<string>('240 KB');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  
  // Custom user meal hint or dish description
  const [mealHint, setMealHint] = useState<string>(PRESET_MEALS[0].hint);
  
  // Analysis result state
  const [analysis, setAnalysis] = useState<MealNutritionAnalysis | null>(null);

  // Interactive selected booster items
  const [selectedBoosterIds, setSelectedBoosterIds] = useState<string[]>([]);

  // Visual Anemia State
  const [anemiaPallorScore, setAnemiaPallorScore] = useState<number>(24);
  const [isScanningAnemia, setIsScanningAnemia] = useState<boolean>(false);

  // Daily 2,400 kcal Burn Goal State & Logged Meals
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(INITIAL_LOGGED_MEALS);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showMealHistory, setShowMealHistory] = useState<boolean>(false);

  // New Meal Input Form State for 'Log Calories'
  const [newMealName, setNewMealName] = useState<string>('');
  const [newMealCalories, setNewMealCalories] = useState<number>(450);
  const [newMealProtein, setNewMealProtein] = useState<number>(15);
  const [newMealType, setNewMealType] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner' | 'hydration'>('lunch');
  const [newMealLaborActivity, setNewMealLaborActivity] = useState<string>('Heavy Masonry & Construction');
  const [logSuccessToast, setLogSuccessToast] = useState<string | null>(null);

  // Diet Chart State & Controls
  const [activeNutritionTab, setActiveNutritionTab] = useState<'screener' | 'diet_chart'>('screener');
  const [dietPlan, setDietPlan] = useState<DietChartPlan | null>(null);
  const [isGeneratingDietPlan, setIsGeneratingDietPlan] = useState<boolean>(false);
  const [dietPref, setDietPref] = useState<'vegetarian' | 'non-vegetarian' | 'eggetarian'>('vegetarian');
  const [dietTargetCals, setDietTargetCals] = useState<number>(compactMode ? 2000 : 2400);
  const [dietBudget, setDietBudget] = useState<number>(compactMode ? 90 : 80);
  const [dietLanguage, setDietLanguage] = useState<string>('Hinglish');
  const [dietCopiedToast, setDietCopiedToast] = useState<boolean>(false);

  const handleGenerateDietChart = async () => {
    setIsGeneratingDietPlan(true);
    try {
      const plan = await geminiService.generateDietChart(
        dietTargetCals,
        compactMode ? 55 : 65,
        dietPref,
        compactMode ? 'Family Household Vitality & Immunity' : 'Heavy Physical Trade Labor (Masonry, Plumbing, Carpentry)',
        dietBudget,
        dietLanguage
      );
      setDietPlan(plan);
    } catch (e) {
      console.error('Diet chart error:', e);
    } finally {
      setIsGeneratingDietPlan(false);
    }
  };

  const handleCopyDietPlan = () => {
    if (!dietPlan) return;
    const text = `${dietPlan.title}\nDaily Target: ${dietPlan.targetCalories} kcal | ${dietPlan.targetProtein}g Protein | Budget: ₹${dietPlan.totalEstimatedDailyCost}/day\n\n` +
      dietPlan.meals.map(m => `[${m.time}] ${m.mealName} (${m.calories} kcal, ${m.protein}g protein, ₹${m.estimatedCostRupees})\nDishes: ${m.dishes.join(', ')}\nTip: ${m.tip}`).join('\n\n') +
      `\n\nWeekly Grocery Tips:\n${dietPlan.weeklyGroceryTips.join('\n')}`;
    navigator.clipboard?.writeText(text);
    setDietCopiedToast(true);
    setTimeout(() => setDietCopiedToast(false), 3000);
  };

  // Visualization mode: Segmented CSS progress bars or Recharts Chart
  const [chartViewMode, setChartViewMode] = useState<'segmented' | 'recharts'>('segmented');
  const [rechartsSubTab, setRechartsSubTab] = useState<'target-fulfillment' | 'dish-breakdown'>('target-fulfillment');

  // Interactive dish hover & portion multiplier controls
  const [hoveredDish, setHoveredDish] = useState<string | null>(null);
  const [dishPortions, setDishPortions] = useState<Record<string, number>>({});

  // Hidden file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initial trigger on mount
  useEffect(() => {
    runAnalysis(PRESET_MEALS[0].imageUrl, PRESET_MEALS[0].hint);
  }, []);

  const runAnalysis = async (imgData: string, hintText?: string) => {
    setIsAnalyzing(true);
    setAnalysisStep('Scanning plate dishes & food geometry...');

    try {
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Estimating Calories, Protein, Iron & Carbohydrates...');
      }, 350);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Evaluating physical labor deficit for 8-hour artisan shift...');
      }, 700);

      const stepTimer3 = setTimeout(() => {
        setAnalysisStep('Curating pocket-friendly local alternatives for Protein & Iron...');
      }, 1050);

      const result = await geminiService.analyzeWorkerMealImage(imgData, 'image/jpeg', hintText || mealHint);
      
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setAnalysis(result);
      setSelectedBoosterIds([]); // Reset active boosters on new meal analysis
      setDishPortions({});
      setHoveredDish(null);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setImageFileName(file.name);
      setImageFileSize(`${Math.round(file.size / 1024)} KB`);
      setMealHint(`Uploaded meal photo: ${file.name}`);
      runAnalysis(base64, `Uploaded meal photo: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: typeof PRESET_MEALS[0]) => {
    setSelectedImage(preset.imageUrl);
    setImageFileName(`${preset.label.toLowerCase().replace(/\s+/g, '_')}.jpg`);
    setImageFileSize('320 KB');
    setMealHint(preset.hint);
    runAnalysis(preset.imageUrl, preset.hint);
  };

  // Toggle booster item in diet
  const toggleBooster = (id: string) => {
    setSelectedBoosterIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculate dynamic upgraded metrics based on active boosters
  const allRecommendations = [
    ...(analysis?.proteinRecommendations || []).map((r, i) => ({ ...r, id: `p-${i}` })),
    ...(analysis?.ironRecommendations || []).map((r, i) => ({ ...r, id: `i-${i}` }))
  ];

  const addedProteinGrams = allRecommendations
    .filter((r) => selectedBoosterIds.includes(r.id))
    .reduce((sum, r) => sum + (r.proteinGramsAdded || 0), 0);

  const addedIronMg = allRecommendations
    .filter((r) => selectedBoosterIds.includes(r.id))
    .reduce((sum, r) => sum + (r.ironMgAdded || 0), 0);

  const addedCostRupees = allRecommendations
    .filter((r) => selectedBoosterIds.includes(r.id))
    .reduce((sum, r) => {
      const num = parseInt(r.cost.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + num;
    }, 0);

  // Adjust portion size of an identified dish
  const adjustDishPortion = (dishName: string, delta: number) => {
    setDishPortions((prev) => {
      const current = prev[dishName] ?? 1;
      const next = Math.max(0, Math.min(3, Number((current + delta).toFixed(1))));
      return { ...prev, [dishName]: next };
    });
  };

  // Dish-level nutrient contributions dynamically derived from AI identified items
  const dishNutrients = useMemo(() => {
    if (!analysis) return [];
    const items = analysis.identifiedItems;
    if (!items || items.length === 0) return [];
    
    // Relative weights based on common Indian culinary composition
    const baseWeights = items.map((dish) => {
      const lower = dish.toLowerCase();
      let calWeight = 1;
      let proteinWeight = 1;
      let ironWeight = 1;

      if (lower.includes('dal') || lower.includes('lentil') || lower.includes('sambar')) {
        calWeight = 1.3;
        proteinWeight = 3.2;
        ironWeight = 2.5;
      } else if (lower.includes('egg') || lower.includes('anda')) {
        calWeight = 1.4;
        proteinWeight = 4.5;
        ironWeight = 1.8;
      } else if (lower.includes('soya') || lower.includes('paneer')) {
        calWeight = 1.5;
        proteinWeight = 5.0;
        ironWeight = 1.2;
      } else if (lower.includes('roti') || lower.includes('chapati') || lower.includes('paratha')) {
        calWeight = 1.6;
        proteinWeight = 2.0;
        ironWeight = 2.0;
      } else if (lower.includes('rice') || lower.includes('chawal') || lower.includes('biryani')) {
        calWeight = 1.8;
        proteinWeight = 1.5;
        ironWeight = 0.8;
      } else if (lower.includes('sabzi') || lower.includes('curry') || lower.includes('bhaji') || lower.includes('aloo')) {
        calWeight = 1.0;
        proteinWeight = 1.0;
        ironWeight = 1.5;
      } else if (lower.includes('chana') || lower.includes('moong') || lower.includes('sprout')) {
        calWeight = 1.2;
        proteinWeight = 3.5;
        ironWeight = 3.0;
      }
      return { dish, calWeight, proteinWeight, ironWeight };
    });

    const totalCalWeight = baseWeights.reduce((acc, curr) => acc + curr.calWeight, 0) || 1;
    const totalProtWeight = baseWeights.reduce((acc, curr) => acc + curr.proteinWeight, 0) || 1;
    const totalIronWeight = baseWeights.reduce((acc, curr) => acc + curr.ironWeight, 0) || 1;

    const colors = [
      '#0D9488', // teal-600
      '#F59E0B', // amber-500
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#EC4899', // pink-500
      '#8B5CF6', // purple-500
      '#F97316'  // orange-500
    ];

    return baseWeights.map((item, idx) => {
      const portion = dishPortions[item.dish] ?? 1;
      const baseCals = Math.round((item.calWeight / totalCalWeight) * analysis.calories);
      const baseProt = Number(((item.proteinWeight / totalProtWeight) * analysis.protein).toFixed(1));
      const baseIron = Number(((item.ironWeight / totalIronWeight) * analysis.ironMg).toFixed(1));
      
      return {
        name: item.dish,
        portion,
        calories: Math.round(baseCals * portion),
        protein: Number((baseProt * portion).toFixed(1)),
        iron: Number((baseIron * portion).toFixed(1)),
        baseCals,
        baseProt,
        baseIron,
        color: colors[idx % colors.length]
      };
    });
  }, [analysis, dishPortions]);

  // Dynamic base meal totals taking portion adjustments into account
  const baseMealCalories = useMemo(() => {
    return dishNutrients.reduce((sum, d) => sum + d.calories, 0);
  }, [dishNutrients]);

  const baseMealProtein = useMemo(() => {
    return Number(dishNutrients.reduce((sum, d) => sum + d.protein, 0).toFixed(1));
  }, [dishNutrients]);

  const baseMealIron = useMemo(() => {
    return Number(dishNutrients.reduce((sum, d) => sum + d.iron, 0).toFixed(1));
  }, [dishNutrients]);

  // Active boosters dynamic nutrient contributions
  const activeBoosters = useMemo(() => {
    return allRecommendations
      .filter((r) => selectedBoosterIds.includes(r.id))
      .map((r, idx) => ({
        id: r.id,
        name: r.text.split('(')[0].trim(),
        calories: r.nutrient === 'Protein' ? 85 : 40,
        protein: r.proteinGramsAdded || 0,
        iron: r.ironMgAdded || 0,
        color: idx % 2 === 0 ? '#059669' : '#10B981'
      }));
  }, [allRecommendations, selectedBoosterIds]);

  const addedBoosterCalories = activeBoosters.reduce((sum, b) => sum + b.calories, 0);
  const totalCaloriesWithBoosters = baseMealCalories + addedBoosterCalories;
  
  const currentProtein = Number((baseMealProtein + addedProteinGrams).toFixed(1));
  const currentIron = Number((baseMealIron + addedIronMg).toFixed(1));
  const proteinTarget = analysis?.proteinTarget || 65;
  const ironTarget = analysis?.ironTarget || 17;
  const calTarget = analysis?.calTarget || 2400;

  const proteinPercent = Math.min(150, Math.round((currentProtein / proteinTarget) * 100));
  const ironPercent = Math.min(150, Math.round((currentIron / ironTarget) * 100));
  const calPercent = Math.min(150, Math.round((totalCaloriesWithBoosters / calTarget) * 100));

  // Estimated physical labor duration supported by current energy intake (Burn rate ~300 kcal/hr)
  const hoursSupported = Math.min(12, Number((totalCaloriesWithBoosters / 300).toFixed(1)));
  const baselineHoursSupported = Math.min(12, Number((baseMealCalories / 300).toFixed(1)));

  // Recharts Dataset 1: Normalized % of Daily Labor Target Met
  const rechartsTargetData = useMemo(() => {
    const baseProtPct = Math.round((baseMealProtein / proteinTarget) * 100);
    const boostProtPct = Math.round((addedProteinGrams / proteinTarget) * 100);

    const baseCalPct = Math.round((baseMealCalories / calTarget) * 100);
    const boostCalPct = Math.round((addedBoosterCalories / calTarget) * 100);

    const baseIronPct = Math.round((baseMealIron / ironTarget) * 100);
    const boostIronPct = Math.round((addedIronMg / ironTarget) * 100);

    return [
      {
        name: 'Protein',
        label: 'Protein (65g Target)',
        BaseMeal: baseProtPct,
        KiranaBoosters: boostProtPct,
        TotalPct: baseProtPct + boostProtPct,
        currentValue: `${currentProtein}g`,
        targetValue: `${proteinTarget}g`,
        unit: 'g'
      },
      {
        name: 'Energy',
        label: 'Energy (2,400 kcal Target)',
        BaseMeal: baseCalPct,
        KiranaBoosters: boostCalPct,
        TotalPct: baseCalPct + boostCalPct,
        currentValue: `${totalCaloriesWithBoosters} kcal`,
        targetValue: `${calTarget} kcal`,
        unit: 'kcal'
      },
      {
        name: 'Iron',
        label: 'Iron (17mg Target)',
        BaseMeal: baseIronPct,
        KiranaBoosters: boostIronPct,
        TotalPct: baseIronPct + boostIronPct,
        currentValue: `${currentIron}mg`,
        targetValue: `${ironTarget}mg`,
        unit: 'mg'
      }
    ];
  }, [baseMealProtein, addedProteinGrams, currentProtein, proteinTarget, baseMealCalories, addedBoosterCalories, totalCaloriesWithBoosters, calTarget, baseMealIron, addedIronMg, currentIron, ironTarget]);

  // Recharts Dataset 2: Identified Item Macro Breakdown
  const rechartsDishData = useMemo(() => {
    return [
      ...dishNutrients.map((d) => ({
        name: d.name.length > 13 ? d.name.substring(0, 11) + '..' : d.name,
        fullName: d.name,
        Protein: d.protein,
        Calories: d.calories,
        type: 'Plate Item'
      })),
      ...activeBoosters.map((b) => ({
        name: `+${b.name.length > 10 ? b.name.substring(0, 8) + '..' : b.name}`,
        fullName: `Kirana Booster: ${b.name}`,
        Protein: b.protein,
        Calories: b.calories,
        type: 'Kirana Addition'
      }))
    ];
  }, [dishNutrients, activeBoosters]);

  // Daily 2,400 kcal Burn Goal Target & Calculations
  const DAILY_BURN_TARGET = 2400; // 2,400 kcal daily burn goal for physical trade labor
  
  const totalLoggedCalories = useMemo(() => {
    return loggedMeals.reduce((sum, m) => sum + m.calories, 0);
  }, [loggedMeals]);

  const totalLoggedProtein = useMemo(() => {
    return loggedMeals.reduce((sum, m) => sum + m.protein, 0);
  }, [loggedMeals]);

  const dailyBurnPercentage = Math.round((totalLoggedCalories / DAILY_BURN_TARGET) * 100);
  const caloriesRemaining = Math.max(0, DAILY_BURN_TARGET - totalLoggedCalories);
  const hoursLaborFueled = Number((totalLoggedCalories / 300).toFixed(1)); // ~300 kcal/hr trade burn rate

  // Add custom meal to daily burn log
  const handleAddCustomMeal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = newMealName.trim() || 'Worker Shift Fuel Meal';
    const cals = Number(newMealCalories) || 300;
    const prot = Number(newMealProtein) || 10;
    
    const newEntry: LoggedMeal = {
      id: `log-${Date.now()}`,
      name: title,
      calories: cals,
      protein: prot,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: newMealType,
      laborActivity: newMealLaborActivity
    };

    setLoggedMeals(prev => [newEntry, ...prev]);
    setShowLogModal(false);
    setNewMealName('');
    setNewMealCalories(450);
    setNewMealProtein(15);
    setLogSuccessToast(`Logged "${title}" (+${cals} kcal)! Progress updated against 2,400 kcal burn goal.`);
    setTimeout(() => setLogSuccessToast(null), 3500);
  };

  const handleSelectPreset = (preset: typeof COMMON_MEAL_PRESETS[0]) => {
    setNewMealName(preset.name);
    setNewMealCalories(preset.calories);
    setNewMealProtein(preset.protein);
    setNewMealType(preset.mealType);
  };

  const handleDeleteLoggedMeal = (id: string) => {
    setLoggedMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleAddScannedMealToDailyLog = () => {
    if (!analysis) return;
    const title = imageFileName ? `Scanned: ${imageFileName.replace('.jpg', '').replace('.png', '').replace(/_/g, ' ')}` : 'Scanned Artisan Thali';
    const newEntry: LoggedMeal = {
      id: `log-${Date.now()}`,
      name: title,
      calories: totalCaloriesWithBoosters,
      protein: currentProtein,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mealType: 'lunch',
      laborActivity: 'Active Trade Shift Fuel'
    };
    setLoggedMeals(prev => [newEntry, ...prev]);
    setLogSuccessToast(`Logged scanned plate (+${totalCaloriesWithBoosters} kcal) to today's 2,400 kcal burn goal!`);
    setTimeout(() => setLogSuccessToast(null), 3500);
  };

  // Determine anemia badge
  const anemiaRiskLabel = 
    anemiaPallorScore > 28 ? 'High Anemia Risk (Check Eyelid)' : 
    anemiaPallorScore > 18 ? 'Mild Pallor Detected' : 
    'Normal Conjunctival Hemoglobin';

  return (
    <div className="space-y-4">
      {/* Module 3 Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white p-4 rounded-3xl border border-teal-800/60 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center font-bold">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-300">
                  {userMode === 'worker' ? 'AI WORKER NUTRITION & HEALTH SCREENER' : 'AI FAMILY & CUSTOMER NUTRITION TRACKER'}
                </h3>
                <span className="bg-teal-500/30 text-teal-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-teal-400/30">
                  {userMode === 'worker' ? 'WORKER MODE' : 'CUSTOMER MODE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                {userMode === 'worker'
                  ? 'Blue-collar thali scanner • Protein & iron deficiency diagnosis • Pocket-friendly kirana boosters'
                  : 'Family meal photo scanner • Exact calories & macros • Customized Indian diet charts'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-bold bg-white/10 text-teal-200 px-2.5 py-1 rounded-xl">
              {userMode === 'worker' ? 'Heavy Labor Spec (2,400 kcal)' : 'Daily Target (2,000-2,400 kcal)'}
            </span>
            {onOpenAIAssistant && (
              <button
                type="button"
                onClick={onOpenAIAssistant}
                className="py-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all active:scale-95 shadow-xs"
              >
                <Sparkles size={11} />
                <span>Ask AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          COLUMN 3 SUBTAB NAVIGATOR: THALI SCANNER & 2,400 KCAL BURN vs DIET CHART MAKER
         ========================================================================= */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-bold shadow-xs">
        <button
          type="button"
          onClick={() => setActiveNutritionTab('screener')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeNutritionTab === 'screener'
              ? 'bg-teal-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame size={14} className={activeNutritionTab === 'screener' ? 'text-amber-300' : 'text-slate-500'} />
          <span>Thali Scanner & 2,400 kcal Burn Tracker</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveNutritionTab('diet_chart');
            if (!dietPlan) handleGenerateDietChart();
          }}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeNutritionTab === 'diet_chart'
              ? 'bg-teal-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet size={14} className={activeNutritionTab === 'diet_chart' ? 'text-amber-300' : 'text-slate-500'} />
          <span>AI Indian Diet Chart Maker</span>
          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
            CUSTOM
          </span>
        </button>
      </div>

      {activeNutritionTab === 'screener' ? (
        <>
          {/* =========================================================================
              DAILY 2,400 KCAL BURN GOAL TRACKER & LOG CALORIES MODULE
             ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-4 sm:p-5 border-2 border-teal-500/40 shadow-xl space-y-4">
        {/* Header & 'Log Calories' CTA Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shadow-inner flex-shrink-0">
              <Flame size={22} className="animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  Daily 2,400 kcal Labor Burn Goal
                </h4>
                <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-400/30">
                  PHYSICAL TARGET
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Tracks daily nutritional calories fueled against heavy 8-hr trade labor expenditure (~300 kcal/hr)
              </p>
            </div>
          </div>

          {/* Action Buttons: Log Calories & Scanned Meal */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Flame size={14} className="fill-slate-950" />
              <span>Log Calories</span>
            </button>

            {analysis && (
              <button
                type="button"
                onClick={handleAddScannedMealToDailyLog}
                className="py-2 px-3 bg-teal-800/80 hover:bg-teal-700 text-teal-200 border border-teal-500/40 font-bold text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Add current scanned plate into daily burn log"
              >
                <Plus size={13} />
                <span>+ Log Scanned Plate ({totalCaloriesWithBoosters} kcal)</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Toast Banner */}
        {logSuccessToast && (
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="font-semibold">{logSuccessToast}</span>
            </div>
            <button type="button" onClick={() => setLogSuccessToast(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Real-time Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Logged Fuel Today</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black font-mono text-white">{totalLoggedCalories}</span>
              <span className="text-[11px] text-slate-400">/ 2,400 kcal</span>
            </div>
            <span className="text-[9px] text-teal-400 font-semibold block mt-0.5">
              {loggedMeals.length} meals recorded
            </span>
          </div>

          <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Shift Goal Progress</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-lg font-black font-mono ${
                dailyBurnPercentage >= 100 ? 'text-emerald-400' : dailyBurnPercentage >= 70 ? 'text-amber-300' : 'text-orange-400'
              }`}>
                {dailyBurnPercentage}%
              </span>
              <span className="text-[11px] text-slate-400">fulfilled</span>
            </div>
            <span className="text-[9px] text-slate-300 font-semibold block mt-0.5 truncate">
              {dailyBurnPercentage >= 100 ? 'Full Shift Target Met ✓' : `${caloriesRemaining} kcal remaining`}
            </span>
          </div>

          <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Physical Labor Stamina</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black font-mono text-amber-300">~{hoursLaborFueled}</span>
              <span className="text-[11px] text-slate-400">hrs</span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              @ 300 kcal/hr trade burn
            </span>
          </div>

          <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Daily Protein Ingested</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black font-mono text-teal-300">{totalLoggedProtein}g</span>
              <span className="text-[11px] text-slate-400">/ 65g target</span>
            </div>
            <span className="text-[9px] text-slate-300 font-semibold block mt-0.5">
              {Math.min(100, Math.round((totalLoggedProtein / 65) * 100))}% muscle repair quota
            </span>
          </div>
        </div>

        {/* =====================================================================
            VISUAL PROGRESS BAR TRACKING 2,400 KCAL BURN GOAL
           ===================================================================== */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Activity size={13} className="text-amber-400" />
              <span>Shift Caloric Burn Progress:</span>
            </span>
            <span className="font-mono font-black text-amber-300 text-xs">
              {totalLoggedCalories} / 2,400 kcal ({dailyBurnPercentage}%)
            </span>
          </div>

          {/* Large Multi-Tier Visual Progress Bar with Milestone Notches */}
          <div className="relative">
            <div className="w-full h-6 rounded-2xl bg-slate-950/80 border-2 border-white/20 overflow-hidden flex relative shadow-inner p-0.5">
              {/* Animated Glowing Fill Bar */}
              <div
                style={{ width: `${Math.min(100, dailyBurnPercentage)}%` }}
                className={`h-full rounded-xl transition-all duration-500 relative flex items-center justify-end pr-2 ${
                  dailyBurnPercentage >= 100 
                    ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : dailyBurnPercentage >= 65
                    ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500'
                }`}
              >
                {dailyBurnPercentage >= 20 && (
                  <span className="text-[10px] font-black font-mono text-slate-950 bg-white/90 px-1.5 py-0.2 rounded-md shadow-xs">
                    {totalLoggedCalories} kcal
                  </span>
                )}
              </div>

              {/* Milestone Notches (Overlayed on the Track) */}
              <div className="absolute inset-0 flex justify-between pointer-events-none px-0.5 items-center">
                <div className="h-full w-px bg-white/25" style={{ marginLeft: '25%' }} title="25% - 600 kcal" />
                <div className="h-full w-px bg-white/25" style={{ marginLeft: '25%' }} title="50% - 1,200 kcal" />
                <div className="h-full w-px bg-white/25" style={{ marginLeft: '25%' }} title="75% - 1,800 kcal" />
              </div>
            </div>

            {/* Labels beneath milestones */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1.5 px-1">
              <span>0 kcal</span>
              <span className="text-center">600 kcal<br/><span className="text-[8px] text-slate-500">Morning Shift</span></span>
              <span className="text-center font-bold text-slate-300">1,200 kcal<br/><span className="text-[8px] text-amber-400/90">Midday Labor</span></span>
              <span className="text-center">1,800 kcal<br/><span className="text-[8px] text-slate-500">Afternoon Peak</span></span>
              <span className={`text-right font-black flex items-center gap-0.5 ${
                dailyBurnPercentage >= 100 ? 'text-emerald-400' : 'text-amber-300'
              }`}>
                {dailyBurnPercentage >= 100 ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Flame size={11} />}
                2,400 kcal<br/><span className="text-[8px]">Goal (8h Shift)</span>
              </span>
            </div>
          </div>

          {/* Shift Status Advisory Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                dailyBurnPercentage >= 100 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : dailyBurnPercentage >= 65
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}>
                {dailyBurnPercentage >= 100 
                  ? 'Full 8-Hour Labor Fuel Target Achieved ✓'
                  : dailyBurnPercentage >= 65
                  ? `Shift In-Progress • ~${hoursLaborFueled} hrs labor stamina unlocked`
                  : 'Morning Energy Deficit • Log midday meal to avoid trade fatigue'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowMealHistory(prev => !prev)}
              className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 underline underline-offset-2 self-start sm:self-auto cursor-pointer"
            >
              <History size={13} />
              <span>{showMealHistory ? 'Hide Meal Log' : `View Logged Meals (${loggedMeals.length})`}</span>
              {showMealHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Collapsible Logged Meals History */}
          {showMealHistory && (
            <div className="bg-slate-950/60 rounded-2xl p-3 border border-white/10 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock size={12} className="text-amber-400" />
                  <span>Today's Meal Log Timeline ({totalLoggedCalories} kcal total)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogModal(true)}
                  className="text-[10px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={11} /> Add Entry
                </button>
              </div>

              {loggedMeals.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic text-center py-2">
                  No meals logged yet today. Click 'Log Calories' to add your breakfast, lunch or snacks.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {loggedMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">
                          {meal.mealType === 'breakfast' ? '☕' : meal.mealType === 'lunch' ? '🍛' : meal.mealType === 'dinner' ? '🍲' : meal.mealType === 'hydration' ? '🍋' : '🥟'}
                        </span>
                        <div className="min-w-0">
                          <h6 className="font-bold text-slate-200 text-[11px] truncate">{meal.name}</h6>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <span>{meal.time}</span>
                            <span>•</span>
                            <span className="capitalize">{meal.mealType}</span>
                            {meal.laborActivity && (
                              <>
                                <span>•</span>
                                <span className="text-amber-300/80 truncate max-w-[120px]">{meal.laborActivity}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-black text-amber-300 text-xs block">
                            +{meal.calories} kcal
                          </span>
                          <span className="text-[9px] text-teal-300 font-mono">
                            {meal.protein}g protein
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteLoggedMeal(meal.id)}
                          className="w-6 h-6 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove entry"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Utensils size={13} className="text-teal-700" />
            <span>1. Thali Meal Photo Scanner (Drag & Drop)</span>
          </label>
          <span className="text-[10px] font-bold text-teal-700">
            JPG, PNG, WebP supported
          </span>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-4 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
            isDragging 
              ? 'border-teal-500 bg-teal-50/80 scale-[1.01] shadow-lg ring-4 ring-teal-500/20' 
              : 'border-slate-300 hover:border-teal-600 bg-slate-50/70 hover:bg-slate-50'
          }`}
        >
          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Laser scanning line animation overlay during analysis */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-teal-950/20 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-bounce shadow-[0_0_15px_#2dd4bf]" />
              <div className="bg-slate-900/90 text-white px-4 py-2 rounded-2xl border border-teal-400/40 shadow-xl flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-teal-400" />
                <span className="text-xs font-bold">{analysisStep}</span>
              </div>
            </div>
          )}

          {/* Upload Area Content */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src={selectedImage}
                  alt="Scanned Worker Meal"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center shadow hover:bg-teal-800"
                  title="Take photo using camera"
                >
                  <Camera size={12} />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block">
                  Active Meal Image
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                  {imageFileName}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {imageFileSize} • Drop new image or tap to browse
                </p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Upload size={10} /> Drag & Drop
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="text-[9px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md hover:bg-teal-200 flex items-center gap-1"
                  >
                    <Camera size={10} /> Snap Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Re-Analyze Button */}
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={(e) => {
                e.stopPropagation();
                runAnalysis(selectedImage);
              }}
              className="px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all self-stretch sm:self-auto justify-center"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
            </button>
          </div>
        </div>

        {/* Quick Preset Meal Selectors */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 block">
            Quick-Select Worker Daily Meal Presets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {PRESET_MEALS.map((preset) => {
              const isSelected = selectedImage === preset.imageUrl;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-2 rounded-2xl text-left border transition-all text-xs flex items-center gap-2 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 text-teal-950 ring-2 ring-teal-500/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.label}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold block truncate leading-tight">
                      {preset.label}
                    </span>
                    <span className="text-[8px] font-black uppercase text-slate-400">
                      {preset.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. AI NUTRITION BREAKDOWN & DEFICIENCY DIAGNOSIS
         ========================================================================= */}
      {analysis && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3.5">
          {/* Meal Title & Identified Items */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  AI Vision Verified
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {analysis.identifiedItems.length} dishes detected
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-0.5">
                {analysis.mealName}
              </h4>
              {/* Interactive AI-Identified Dish Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                  Plate Items:
                </span>
                {dishNutrients.map((dish, idx) => {
                  const isHovered = hoveredDish === dish.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHoveredDish(prev => prev === dish.name ? null : dish.name)}
                      onMouseEnter={() => setHoveredDish(dish.name)}
                      onMouseLeave={() => setHoveredDish(null)}
                      style={{
                        borderColor: isHovered ? dish.color : '#E2E8F0',
                        backgroundColor: isHovered ? `${dish.color}15` : '#F8FAFC'
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        isHovered ? 'ring-2 scale-105 font-black text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <span 
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dish.color }} 
                      />
                      <span>{dish.name}</span>
                      <span className="text-[9px] opacity-75 font-mono">
                        ({dish.protein}g P • {dish.calories} kcal)
                      </span>
                      {dish.portion !== 1 && (
                        <span className="bg-amber-100 text-amber-900 text-[8px] font-black px-1 rounded">
                          {dish.portion}x
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Macro Summary Tag */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="text-center px-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Energy</span>
                <span className="text-xs font-black font-mono text-slate-900">
                  {totalCaloriesWithBoosters} kcal
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center px-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Protein</span>
                <span className="text-xs font-black font-mono text-teal-800">
                  {currentProtein}g
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-center px-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Iron</span>
                <span className="text-xs font-black font-mono text-rose-800">
                  {currentIron}mg
                </span>
              </div>
            </div>
          </div>

          {/* Deficit Alert Warning Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Protein Deficit Status */}
            <div className={`p-2.5 rounded-2xl border flex items-start gap-2 ${
              currentProtein < proteinTarget * 0.6
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : currentProtein < proteinTarget
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <AlertTriangle size={15} className={`flex-shrink-0 mt-0.5 ${
                currentProtein < proteinTarget * 0.6 ? 'text-rose-600' : currentProtein < proteinTarget ? 'text-amber-600' : 'text-emerald-600'
              }`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[11px]">Protein Labor Status:</span>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                    currentProtein >= proteinTarget ? 'bg-emerald-200 text-emerald-900' : 'bg-white/80'
                  }`}>
                    {currentProtein >= proteinTarget ? 'Daily Target Met ✓' : `${Math.round(proteinPercent)}% of Labor Target`}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 opacity-90">
                  {currentProtein >= proteinTarget ? (
                    <span className="text-emerald-800 font-medium">Optimal daily intake for muscle repair and continuous tool handling.</span>
                  ) : (
                    <span>Needs +{Number((proteinTarget - currentProtein).toFixed(1))}g protein to reach 65g target for 8-hr labor stamina.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Iron & Anemia Status */}
            <div className={`p-2.5 rounded-2xl border flex items-start gap-2 ${
              currentIron < ironTarget * 0.6 
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : currentIron < ironTarget
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <Heart size={15} className={`flex-shrink-0 mt-0.5 ${
                currentIron >= ironTarget ? 'text-emerald-600' : 'text-rose-600'
              }`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[11px]">Iron & Blood Oxygenation:</span>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                    currentIron >= ironTarget ? 'bg-emerald-200 text-emerald-900' : 'bg-white/80'
                  }`}>
                    {currentIron >= ironTarget ? 'Target Met ✓' : `${Math.round(ironPercent)}% of Target`}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 opacity-90">
                  {currentIron >= ironTarget ? (
                    <span className="text-emerald-800 font-medium">Sufficient hemoglobin support to prevent physical labor exhaustion.</span>
                  ) : (
                    <span>Requires +{Number((ironTarget - currentIron).toFixed(1))}mg iron + ascorbic acid (lemon) to prevent site fatigue.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              DYNAMIC VISUAL PROGRESS BARS (CSS-BASED & RECHARTS)
             ========================================================================= */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-black text-slate-800 uppercase tracking-tight text-xs flex items-center gap-1.5">
                  <Activity size={14} className="text-teal-700" />
                  <span>Daily Labor Recommended Nutrition Meters</span>
                </span>
                <p className="text-[10px] text-slate-500">
                  Targeted for heavy artisan & construction trade labor (2,400 kcal & 65g Protein)
                </p>
              </div>

              {/* View Switcher: Segmented Progress Bars vs Recharts Chart */}
              <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setChartViewMode('segmented')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    chartViewMode === 'segmented'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 size={11} />
                  <span>Segmented Bars</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('recharts')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    chartViewMode === 'recharts'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieChart size={11} />
                  <span>Recharts Chart</span>
                </button>
              </div>
            </div>

            {/* Added Boosters Highlight Pill */}
            {(addedProteinGrams > 0 || addedIronMg > 0) && (
              <div className="p-2.5 bg-emerald-100/90 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-emerald-900 shadow-2xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Zap size={13} className="text-emerald-700 animate-pulse" />
                  Active Kirana Boosters Stacking into Progress Bars:
                </span>
                <span className="font-mono font-black text-emerald-950 bg-emerald-200/80 px-2 py-0.5 rounded-lg">
                  +{addedProteinGrams}g Protein • +{addedIronMg.toFixed(1)}mg Iron (+₹{addedCostRupees}/day)
                </span>
              </div>
            )}

            {chartViewMode === 'segmented' ? (
              <div className="space-y-4 pt-1">
                {/* 1. Protein Progress Bar (Daily Recommended Intake: 65g) */}
                <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-teal-700" />
                      <div>
                        <span className="font-black text-slate-800 text-[11px] block">
                          Protein Intake vs Daily Labor Target
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">
                          65g RDA for Muscle Fiber Repair & Heavy Work
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-teal-900 text-xs">
                        {currentProtein}g / {proteinTarget}g ({proteinPercent}%)
                      </span>
                      {currentProtein >= proteinTarget ? (
                        <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          Target Met ✓
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                          -{Number((proteinTarget - currentProtein).toFixed(1))}g Deficit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Segment Stacked Progress Bar with Target Notch */}
                  <div className="relative pt-1 pb-2">
                    {/* The Bar Track */}
                    <div className="w-full h-4.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex shadow-inner relative">
                      {/* Dish segments from AI identified items */}
                      {dishNutrients.map((dish, idx) => {
                        const widthPct = Math.min(100, (dish.protein / proteinTarget) * 100);
                        if (widthPct <= 0) return null;
                        const isHovered = hoveredDish === dish.name;

                        return (
                          <div
                            key={idx}
                            style={{ 
                              width: `${widthPct}%`,
                              backgroundColor: dish.color 
                            }}
                            onMouseEnter={() => setHoveredDish(dish.name)}
                            onMouseLeave={() => setHoveredDish(null)}
                            className={`h-full transition-all duration-300 relative group cursor-pointer border-r border-white/30 ${
                              isHovered ? 'brightness-125 z-10 ring-2 ring-white shadow-md' : 'hover:brightness-110'
                            }`}
                            title={`${dish.name}: ${dish.protein}g protein (${Math.round(widthPct)}% of daily target)`}
                          />
                        );
                      })}

                      {/* Active Boosters Segment (Animated Pattern) */}
                      {activeBoosters.map((booster, idx) => {
                        const widthPct = Math.min(100, (booster.protein / proteinTarget) * 100);
                        if (widthPct <= 0) return null;

                        return (
                          <div
                            key={`b-${idx}`}
                            style={{ 
                              width: `${widthPct}%`,
                              backgroundColor: booster.color 
                            }}
                            className="h-full transition-all duration-300 relative group cursor-pointer border-l-2 border-white/60 animate-pulse"
                            title={`Kirana Booster (${booster.name}): +${booster.protein}g protein`}
                          />
                        );
                      })}

                      {/* Remaining Deficit Filler */}
                      {currentProtein < proteinTarget && (
                        <div 
                          style={{ width: `${Math.max(0, 100 - proteinPercent)}%` }}
                          className="h-full bg-slate-100/80 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:6px_6px] flex items-center justify-center"
                          title={`Unfulfilled Labor Deficit: ${Number((proteinTarget - currentProtein).toFixed(1))}g`}
                        />
                      )}
                    </div>

                    {/* Benchmark Notch at 100% Target */}
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1 px-1">
                      <span>0g</span>
                      <span>25% (16g)</span>
                      <span>50% (32g)</span>
                      <span>75% (48g)</span>
                      <span className="font-bold text-teal-800 flex items-center gap-0.5">
                        <CheckCircle2 size={10} className="text-teal-600" /> 100% (65g Target)
                      </span>
                    </div>
                  </div>

                  {/* Dish-by-Dish Interactive Item Steppers & Contribution Legend */}
                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5">
                      Plate Dish Contribution & Portion Fine-Tuning:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {dishNutrients.map((dish, idx) => {
                        const isHovered = hoveredDish === dish.name;
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredDish(dish.name)}
                            onMouseLeave={() => setHoveredDish(null)}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              isHovered 
                                ? 'border-teal-500 bg-teal-50/80 shadow-xs' 
                                : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span 
                                className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                                style={{ backgroundColor: dish.color }} 
                              />
                              <span className="font-bold text-slate-800 text-[11px] truncate">
                                {dish.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-mono font-black text-teal-900 text-[11px]">
                                {dish.protein}g
                              </span>
                              
                              {/* Portion Stepper (- / +) to test real-time progress bar changes */}
                              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    adjustDishPortion(dish.name, -0.5);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-[10px] font-bold"
                                  title="Reduce portion"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-mono font-bold px-1 text-slate-700">
                                  {dish.portion}x
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    adjustDishPortion(dish.name, 0.5);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-[10px] font-bold"
                                  title="Add extra portion"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Active Boosters In Legend */}
                      {activeBoosters.map((b, idx) => (
                        <div
                          key={`leg-b-${idx}`}
                          className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block flex-shrink-0" />
                            <span className="font-bold text-emerald-950 text-[11px]">
                              {b.name} (Booster)
                            </span>
                          </div>
                          <span className="font-mono font-black text-emerald-800 text-[11px]">
                            +{b.protein}g
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Calorie Progress Bar (Daily Recommended Intake: 2,400 kcal) */}
                <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Flame size={14} className="text-amber-500" />
                      <div>
                        <span className="font-black text-slate-800 text-[11px] block">
                          Calorie Intake vs Daily Labor Energy Target
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">
                          2,400 kcal Target for Heavy Physical Construction & Trade Shifts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-900 text-xs">
                        {totalCaloriesWithBoosters} / {calTarget} kcal ({calPercent}%)
                      </span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                        ⚡ ~{hoursSupported} hrs work endurance
                      </span>
                    </div>
                  </div>

                  {/* Multi-Segment Stacked Progress Bar */}
                  <div className="relative pt-1 pb-2">
                    <div className="w-full h-4.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex shadow-inner relative">
                      {/* Dish segments from AI identified items */}
                      {dishNutrients.map((dish, idx) => {
                        const widthPct = Math.min(100, (dish.calories / calTarget) * 100);
                        if (widthPct <= 0) return null;
                        const isHovered = hoveredDish === dish.name;

                        return (
                          <div
                            key={idx}
                            style={{ 
                              width: `${widthPct}%`,
                              backgroundColor: dish.color 
                            }}
                            onMouseEnter={() => setHoveredDish(dish.name)}
                            onMouseLeave={() => setHoveredDish(null)}
                            className={`h-full transition-all duration-300 relative group cursor-pointer border-r border-white/30 ${
                              isHovered ? 'brightness-125 z-10 ring-2 ring-white shadow-md' : 'opacity-90 hover:opacity-100'
                            }`}
                            title={`${dish.name}: ${dish.calories} kcal (${Math.round(widthPct)}% of daily energy target)`}
                          />
                        );
                      })}

                      {/* Active Boosters Calories */}
                      {addedBoosterCalories > 0 && (
                        <div
                          style={{ width: `${Math.min(100, (addedBoosterCalories / calTarget) * 100)}%` }}
                          className="h-full bg-emerald-500 transition-all duration-300 border-l border-white/40 cursor-pointer animate-pulse"
                          title={`Added Kirana Boosters: +${addedBoosterCalories} kcal`}
                        />
                      )}
                    </div>

                    {/* Benchmark Notch at 100% Target */}
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1 px-1">
                      <span>0 kcal</span>
                      <span>600 kcal</span>
                      <span>1,200 kcal</span>
                      <span>1,800 kcal</span>
                      <span className="font-bold text-amber-800 flex items-center gap-0.5">
                        <CheckCircle2 size={10} className="text-amber-600" /> 100% (2,400 kcal)
                      </span>
                    </div>
                  </div>

                  {/* Dish Calorie Share Legend */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                    {dishNutrients.map((dish, idx) => (
                      <span key={idx} className="flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        <span 
                          className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: dish.color }} 
                        />
                        <span className="truncate max-w-[120px]">{dish.name}</span>
                        <strong className="text-slate-900 font-mono">({dish.calories} kcal)</strong>
                      </span>
                    ))}
                    {addedBoosterCalories > 0 && (
                      <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>Kirana Boosters (+{addedBoosterCalories} kcal)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Iron & Blood Hemoglobin Meter (Target: 17mg) */}
                <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-bold text-[11px] flex items-center gap-1.5">
                      <Heart size={13} className="text-rose-500" /> 
                      <span>Blood Hemoglobin & Oxygen Transport (Iron):</span>
                    </span>
                    <span className="font-mono font-bold text-rose-900 text-xs">
                      {currentIron} / {ironTarget}mg ({ironPercent}%)
                      {addedIronMg > 0 && (
                        <span className="text-rose-600 ml-1 font-black">(+{addedIronMg.toFixed(1)}mg)</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                    <div
                      style={{ width: `${Math.min(100, ironPercent)}%` }}
                      className="h-full bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium">
                    <span>Critical to avoid heat dizziness & muscle cramps in sun</span>
                    <span className="font-bold text-rose-800">17mg RDA Target</span>
                  </div>
                </div>

                {/* 4. Physical Labor Shift Preparedness Scorecard */}
                <div className="p-3 bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl border border-teal-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-300 tracking-wider flex items-center gap-1">
                      <Activity size={12} className="text-teal-400" />
                      Physical Labor Readiness Score
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {currentProtein >= proteinTarget && totalCaloriesWithBoosters >= calTarget * 0.85
                        ? 'Full 8-hour construction shift ready • Optimal stamina & rapid recovery.'
                        : `Current fuel supports ~${hoursSupported} hrs heavy work. Boosters add +${(hoursSupported - baselineHoursSupported).toFixed(1)} hrs endurance.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                    <span className="text-[10px] font-bold text-slate-300">Shift Index:</span>
                    <span className="font-mono font-black text-amber-300 text-sm">
                      {Math.min(100, Math.round((proteinPercent * 0.5) + (calPercent * 0.5)))} / 100
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* =====================================================================
                 RECHARTS DYNAMIC VISUAL DASHBOARD
                 ===================================================================== */
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-black text-slate-800 text-xs block">
                      Recharts Dynamic Macro Intake Analysis
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Visualizing labor target fulfillment dynamically from AI identified plate items
                    </span>
                  </div>

                  {/* Sub-view switcher for Recharts */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setRechartsSubTab('target-fulfillment')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        rechartsSubTab === 'target-fulfillment'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Target % Fulfillment
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechartsSubTab('dish-breakdown')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        rechartsSubTab === 'dish-breakdown'
                          ? 'bg-white text-teal-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dish-by-Dish Share
                    </button>
                  </div>
                </div>

                {rechartsSubTab === 'target-fulfillment' ? (
                  <div className="space-y-2">
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={rechartsTargetData}
                          margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }} 
                          />
                          <YAxis 
                            unit="%" 
                            domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax / 20) * 20)]}
                            tick={{ fontSize: 10, fill: '#64748B' }} 
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#0F172A', 
                              color: '#fff', 
                              borderRadius: '0.75rem', 
                              border: 'none',
                              fontSize: '11px',
                              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                            }}
                            formatter={(value: any, name: any, item: any) => {
                              return [`${value}% (${item.payload.currentValue} of ${item.payload.targetValue})`, name];
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} 
                          />
                          {/* 100% Target Reference Line */}
                          <ReferenceLine 
                            y={100} 
                            stroke="#EF4444" 
                            strokeWidth={2} 
                            strokeDasharray="4 4" 
                            label={{ 
                              value: '100% Recommended Labor Target', 
                              fill: '#DC2626', 
                              fontSize: 10, 
                              position: 'top',
                              fontWeight: 700
                            }} 
                          />
                          <Bar 
                            dataKey="BaseMeal" 
                            stackId="intake"
                            name="Scanned Plate Intake" 
                            fill="#0D9488" 
                            radius={[0, 0, 0, 0]} 
                          />
                          <Bar 
                            dataKey="KiranaBoosters" 
                            stackId="intake"
                            name="Added Kirana Boosters" 
                            fill="#10B981" 
                            radius={[6, 6, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>• Red dashed line marks 100% Daily Labor Allowance</span>
                      <span className="font-bold text-teal-800">
                        {currentProtein >= proteinTarget && totalCaloriesWithBoosters >= calTarget ? 'All targets fulfilled!' : 'Deficit closed with local kirana additions'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-56 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={rechartsDishData}
                          margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#64748B' }} 
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#0F172A', 
                              color: '#fff', 
                              borderRadius: '0.75rem', 
                              border: 'none',
                              fontSize: '11px'
                            }}
                            formatter={(value: any, name: any) => {
                              if (name === 'Protein (g)') return [`${value}g`, name];
                              if (name === 'Calories (kcal)') return [`${value} kcal`, name];
                              return [value, name];
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} 
                          />
                          <Bar 
                            dataKey="Protein" 
                            name="Protein (g)" 
                            fill="#0D9488" 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="Calories" 
                            name="Calories (kcal)" 
                            fill="#F59E0B" 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] text-slate-500 text-center italic">
                      *Shows exact macro distribution for each identified food item on your plate.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Labor Health Summary */}
          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs">
            <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1 mb-1">
              <Sparkles size={11} className="text-teal-700" />
              AI Labor Stamina Advisory:
            </span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {analysis.laborHealthSummary}
            </p>
          </div>

          {/* =========================================================================
              3. LOCAL, AFFORDABLE FOOD ALTERNATIVES FOR PROTEIN & IRON
             ========================================================================= */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <IndianRupee size={13} className="text-emerald-700" />
                  <span>Local, Affordable Food Alternatives (Kirana / Stalls)</span>
                </h4>
                <p className="text-[10px] text-slate-500">
                  Tap to add to daily thali and simulate labor stamina boost
                </p>
              </div>
              {addedCostRupees > 0 && (
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                  Total Upgrade: +₹{addedCostRupees}/day
                </span>
              )}
            </div>

            {/* Protein Alternatives Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-teal-800 flex items-center gap-1">
                <Zap size={11} className="text-teal-600" />
                Affordable Protein Additions (For Muscle Repair & Heavy Tool Handling):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.proteinRecommendations.map((rec, i) => {
                  const id = `p-${i}`;
                  const isChecked = selectedBoosterIds.includes(id);

                  return (
                    <div
                      key={id}
                      onClick={() => toggleBooster(id)}
                      className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-teal-600 bg-teal-50/90 shadow-sm ring-1 ring-teal-500'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isChecked ? 'bg-teal-700 text-white' : 'border border-slate-300 text-transparent'
                          }`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-900 leading-snug block">
                              {rec.text}
                            </span>
                            <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              +{rec.proteinGramsAdded}g Protein
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                          {rec.cost}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 mt-1.5 pl-7 leading-tight">
                        {rec.whyHelpful}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Iron & Anemia Alternatives Section */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase text-rose-800 flex items-center gap-1">
                <Heart size={11} className="text-rose-600" />
                Affordable Iron & Absorption Additions (To Cure Midday Pallor & Fatigue):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.ironRecommendations.map((rec, i) => {
                  const id = `i-${i}`;
                  const isChecked = selectedBoosterIds.includes(id);

                  return (
                    <div
                      key={id}
                      onClick={() => toggleBooster(id)}
                      className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-rose-500 bg-rose-50/80 shadow-sm ring-1 ring-rose-400'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isChecked ? 'bg-rose-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-900 leading-snug block">
                              {rec.text}
                            </span>
                            <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {rec.nutrient === 'Vitamin C' ? '3x Iron Absorber' : `+${rec.ironMgAdded}mg Iron`}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                          {rec.cost}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 mt-1.5 pl-7 leading-tight">
                        {rec.whyHelpful}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget Impact Summary Callout */}
            <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 rounded-2xl border border-emerald-300/60 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-950 block">
                    Worker Economic Viability:
                  </span>
                  <p className="text-[11px] text-slate-700">
                    Just <strong>+₹15 to ₹20/day</strong> closes {Math.min(100, Math.round(((addedProteinGrams + addedIronMg * 4) / 45) * 100))}% of the labor nutritional deficit without expensive commercial protein powders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. VISUAL ANEMIA & SYMPTOM SCREENER
         ========================================================================= */}
      <div className="p-3.5 bg-gradient-to-b from-rose-50/70 to-white rounded-3xl border border-rose-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-rose-950">
            <Eye size={15} className="text-rose-600" />
            <span>2. Visual Anemia & Pallor Screener</span>
          </div>
          <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
            Non-Invasive AI
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-snug">
          Worker eyelid conjunctiva or nail-bed photo colorimetry to detect hemoglobin deficiency and fatigue early.
        </p>

        <div className="p-2.5 bg-white rounded-2xl border border-rose-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block">
              AI Colorimetry Pallor Index
            </span>
            <span className="text-sm font-black font-mono text-slate-900">
              {anemiaPallorScore}% Pallor Index
            </span>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
              anemiaPallorScore > 25 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {anemiaRiskLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={isScanningAnemia}
          onClick={() => {
            setIsScanningAnemia(true);
            setTimeout(() => {
              const newScore = Math.floor(18 + Math.random() * 12);
              setAnemiaPallorScore(newScore);
              setIsScanningAnemia(false);
            }, 800);
          }}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <Camera size={13} />
          <span>{isScanningAnemia ? 'Scanning Eyelid Pallor...' : 'Simulate Eyelid / Nail Bed Scan'}</span>
        </button>
      </div>

      {/* =========================================================================
          5. LOCAL HEALTHCARE MAPPING (JAN AUSHADHI KENDRA & PHC)
         ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block flex items-center gap-1">
            <Building2 size={12} className="text-teal-700" />
            3. Local Healthcare Mapping (Pincode 110091)
          </span>
          <span className="text-[10px] text-teal-800 font-bold">
            Free Clinics & ₹2.50 Generic Meds
          </span>
        </div>

        <div className="space-y-2">
          {NEARBY_HEALTHCARE.map((facility) => (
            <div
              key={facility.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition-all text-xs space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Building2 size={13} className="text-teal-700 flex-shrink-0" />
                  <h5 className="font-extrabold text-slate-900 text-xs">{facility.name}</h5>
                </div>
                <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded flex-shrink-0">
                  {facility.distance}
                </span>
              </div>

              <p className="text-[11px] text-slate-500">{facility.address}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[10px]">
                <span className="font-bold text-emerald-700">{facility.savings}</span>
                <a
                  href={`tel:${facility.phone}`}
                  className="text-teal-800 font-black flex items-center gap-0.5 hover:underline"
                >
                  <Phone size={10} /> Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      ) : (
        /* =========================================================================
            AI INDIAN DIET CHART MAKER (WORKER & CUSTOMER NUTRITION)
           ========================================================================= */
        <div className="space-y-4 animate-fadeIn">
          {/* Diet Chart Customizer Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-4 sm:p-5 border-2 border-teal-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black shadow-inner flex-shrink-0">
                  <FileSpreadsheet size={22} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    Personalized Indian Diet Chart Generator
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Calculates full daily 4-meal plan based on your labor calorie burn target & local street budget
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isGeneratingDietPlan}
                onClick={handleGenerateDietChart}
                className="py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <Sparkles size={14} className={isGeneratingDietPlan ? 'animate-spin' : ''} />
                <span>{isGeneratingDietPlan ? 'Calculating...' : 'Re-Generate Diet Chart'}</span>
              </button>
            </div>

            {/* Customizer Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Dietary Preference */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Diet Preference:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'vegetarian', label: 'Veg 🥬' },
                    { id: 'eggetarian', label: 'Egg 🥚' },
                    { id: 'non-vegetarian', label: 'Non-Veg 🍗' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDietPref(p.id as any)}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer truncate ${
                        dietPref === p.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Calories */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target Labor Energy:
                </label>
                <select
                  value={dietTargetCals}
                  onChange={(e) => setDietTargetCals(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={2400}>2,400 kcal (8h Heavy Trade Shift)</option>
                  <option value={2100}>2,100 kcal (Family Daily Health)</option>
                  <option value={1800}>1,800 kcal (Light Artisan Maintenance)</option>
                  <option value={2800}>2,800 kcal (High Intensity Masonry/Trench)</option>
                </select>
              </div>

              {/* Daily Budget */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Daily Food Budget:
                </label>
                <div className="grid grid-cols-4 gap-1 text-[10px] font-bold font-mono">
                  {[60, 80, 100, 150].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setDietBudget(b)}
                      className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        dietBudget === b
                          ? 'bg-emerald-600 text-white border-emerald-400 font-black'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ₹{b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Diet Advice Language:
                </label>
                <select
                  value={dietLanguage}
                  onChange={(e) => setDietLanguage(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Hinglish">Hinglish (Hindi+English)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="English">English</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Copy Toast */}
          {dietCopiedToast && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl flex items-center gap-2 text-xs text-emerald-200">
              <CheckCheck size={14} className="text-emerald-400" />
              <span>Diet chart copied to clipboard! You can paste or WhatsApp it to your phone.</span>
            </div>
          )}

          {/* Diet Plan Result Cards */}
          {isGeneratingDietPlan ? (
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-3">
              <RefreshCw size={24} className="animate-spin text-teal-700 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                Calculating exact macronutrients, sattu/soya optimization & local kirana pricing...
              </p>
            </div>
          ) : dietPlan ? (
            <div className="space-y-4">
              {/* Plan Banner */}
              <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[9px] font-black uppercase text-teal-800 tracking-wider block">
                    ACTIVE 1-DAY DIET PLAN
                  </span>
                  <h4 className="font-black text-slate-900 text-sm mt-0.5">{dietPlan.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{dietPlan.healthSummary}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyDietPlan}
                    className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Copy size={12} />
                    <span>Copy Plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print?.()}
                    className="py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Printer size={12} />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* 4 Meals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dietPlan.meals.map((meal, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="font-mono text-[10px] font-black text-slate-500 uppercase">
                            {meal.time}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                          ~₹{meal.estimatedCostRupees}
                        </span>
                      </div>

                      <h5 className="font-black text-slate-900 text-xs mt-1">{meal.mealName}</h5>

                      {/* Dishes */}
                      <ul className="mt-1.5 space-y-1">
                        {meal.dishes.map((dish, dIdx) => (
                          <li key={dIdx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>{dish}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-amber-900">{meal.calories} kcal</span>
                        <span className="text-teal-800">{meal.protein}g Protein</span>
                        <span className="text-rose-800">{meal.ironMg}mg Iron</span>
                      </div>

                      <p className="text-[10px] text-slate-500 italic bg-amber-50/60 border border-amber-100 p-1.5 rounded-lg leading-tight">
                        💡 <strong>Trade Tip:</strong> {meal.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Grocery Hacks Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <IndianRupee size={12} className="text-emerald-700" />
                  <span>Pocket-Friendly Indian Artisan Grocery Hacks:</span>
                </span>
                <ul className="space-y-1 pl-1">
                  {dietPlan.weeklyGroceryTips.map((tip, idx) => (
                    <li key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* =========================================================================
          LOG CALORIES MODAL DIALOG (MEAL INPUT & BURN TRACKER)
         ========================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold flex-shrink-0">
                  <Flame size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-amber-300 tracking-wider">
                    Log Labor Meal Calories
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    Track meals against the daily 2,400 kcal physical labor burn goal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddCustomMeal} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Quick Indian Worker Meal Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>1-Tap Common Indian Artisan Meals:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {COMMON_MEAL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="p-2 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-1.5 group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-amber-200 truncate">
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-amber-300 bg-black/40 px-1.5 py-0.5 rounded flex-shrink-0">
                        {preset.calories} kcal
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Meal or Food Item Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Roti, Dal Tadka & Aloo Sabzi"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              {/* Meal Type Tabs */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Meal Category & Shift Timing:
                </label>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
                  {[
                    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
                    { id: 'lunch', label: 'Lunch', icon: '☀️' },
                    { id: 'snack', label: 'Tea/Snack', icon: '☕' },
                    { id: 'dinner', label: 'Dinner', icon: '🌙' },
                    { id: 'hydration', label: 'Hydration', icon: '💧' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewMealType(cat.id as any)}
                      className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                        newMealType === cat.id
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories and Protein Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Calories (kcal):</span>
                    <Flame size={12} className="text-amber-400" />
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="3000"
                    required
                    value={newMealCalories}
                    onChange={(e) => setNewMealCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl text-sm font-mono font-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  {/* Quick calorie increment chips */}
                  <div className="flex gap-1 pt-1">
                    {[100, 250, 500].map((add) => (
                      <button
                        key={add}
                        type="button"
                        onClick={() => setNewMealCalories((prev) => Math.min(3000, prev + add))}
                        className="flex-1 py-0.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-md text-[9px] font-mono font-bold text-amber-200 cursor-pointer"
                      >
                        +{add}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Protein (grams):</span>
                    <Zap size={12} className="text-teal-400" />
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={newMealProtein}
                    onChange={(e) => setNewMealProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 focus:border-teal-400 rounded-xl text-sm font-mono font-black text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                  <div className="flex gap-1 pt-1">
                    {[5, 10, 20].map((add) => (
                      <button
                        key={add}
                        type="button"
                        onClick={() => setNewMealProtein((prev) => Math.min(150, prev + add))}
                        className="flex-1 py-0.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-md text-[9px] font-mono font-bold text-teal-200 cursor-pointer"
                      >
                        +{add}g
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical Labor Activity Context */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Associated Trade Labor Shift (for stamina calculation):
                </label>
                <select
                  value={newMealLaborActivity}
                  onChange={(e) => setNewMealLaborActivity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Heavy Masonry & Construction">Heavy Masonry & Brickwork (~340 kcal/hr)</option>
                  <option value="Plumbing Trenching & Pipeline">Underground Trenching & Pipe Laying (~310 kcal/hr)</option>
                  <option value="Electrical Cable Conduit Pulling">Conduit Pulling & Ceiling Work (~280 kcal/hr)</option>
                  <option value="Carpentry & Framework Fitting">Carpentry & Frame Assembly (~290 kcal/hr)</option>
                  <option value="Sanitation & Debris Clearance">Civic Sanitation & Sludge Removal (~320 kcal/hr)</option>
                  <option value="General Artisan Shift Work">General Artisan Trade Shift (~300 kcal/hr)</option>
                </select>
              </div>

              {/* Impact Preview */}
              <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase block">Impact on Daily Burn Target:</span>
                  <span className="text-slate-300 text-[11px]">
                    Current {totalLoggedCalories} kcal &rarr; New: <strong className="text-white font-mono">{totalLoggedCalories + Number(newMealCalories || 0)}</strong> / 2,400 kcal
                  </span>
                </div>
                <span className="font-mono font-black text-amber-300 text-sm">
                  +{Math.round((Number(newMealCalories || 0) / DAILY_BURN_TARGET) * 100)}%
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} strokeWidth={3} />
                  <span>Save to Daily Burn Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerNutritionScreener;
