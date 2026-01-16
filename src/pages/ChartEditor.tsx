import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    MousePointer2,
    TrendingUp,
    AreaChart,
    Minus,
    MoveVertical,
    Square,
    Type,
    MoveUpRight,
    Ruler,
    Brush,
    Eraser,
    Lock,
    Eye,
    ChevronDown,
    ChevronRight,
    BarChart3,
    Bell,
    Undo2,
    Redo2,
    Save,
    Search,
    Maximize2,
    Minimize2,
    Check,
    Loader2,
    Home,
    X,
    Trash2,
    CandlestickChart,
    RotateCcw,
} from 'lucide-react';
import PriceChart from '../components/PriceChart';
import { getIndexData, getMarketSummary, Quote } from '../lib/api';
import { useChartDrawing, DrawingObject } from '../hooks/useChartDrawing';

// Drawing tool definitions
const drawingTools = [
    { id: 'cursor', icon: MousePointer2, label: 'Cursor', shortcut: 'V' },
    { id: 'trendline', icon: TrendingUp, label: 'Trend Line', shortcut: 'T' },
    { id: 'horizontal', icon: Minus, label: 'Horizontal Line', shortcut: 'H' },
    { id: 'vertical', icon: MoveVertical, label: 'Vertical Line', shortcut: 'L' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'text', icon: Type, label: 'Text', shortcut: 'A' },
    { id: 'arrow', icon: MoveUpRight, label: 'Arrow', shortcut: 'W' },
    { id: 'ruler', icon: Ruler, label: 'Ruler', shortcut: 'M' },
    { id: 'brush', icon: Brush, label: 'Brush', shortcut: 'B' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
];


// Chart types
const chartTypes = [
    { id: 'area', name: 'Area', icon: AreaChart },
    { id: 'candle', name: 'Candlestick', icon: CandlestickChart },
    { id: 'line', name: 'Line', icon: TrendingUp },
    { id: 'bar', name: 'Bar', icon: BarChart3 },
];

export default function ChartEditor() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef<SVGSVGElement>(null);

    // Mobile landscape detection
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            const mobile = window.innerWidth < 768;
            const portrait = window.innerHeight > window.innerWidth;
            setIsPortrait(mobile && portrait);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    // State
    const [activeTool, setActiveTool] = useState('cursor');
    const [timeRange, setTimeRange] = useState('1M');
    const [chartType, setChartType] = useState('area');
    const [indexData, setIndexData] = useState<(Quote & { chartData: any[] }) | null>(null);
    const [relatedData, setRelatedData] = useState<{ indices: Quote[]; stocks: Quote[] }>({ indices: [], stocks: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState<Quote | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lockDrawings, setLockDrawings] = useState(false);
    const [showDrawings, setShowDrawings] = useState(true);

    // Modal states
    const [showSymbolSearch, setShowSymbolSearch] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showChartType, setShowChartType] = useState(false);
    const [showSaveMenu, setShowSaveMenu] = useState(false);

    // Search and input states
    const [searchQuery, setSearchQuery] = useState('');
    const [alertPrice, setAlertPrice] = useState('');
    const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
    const [alerts, setAlerts] = useState<{ id: string, price: number, condition: 'above' | 'below' }[]>([]);

    // Drawing state
    const [currentDrawingPreview, setCurrentDrawingPreview] = useState<DrawingObject | null>(null);
    const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, value: '' });

    // Collapsible sections
    const [indicesCollapsed, setIndicesCollapsed] = useState(false);
    const [stocksCollapsed, setStocksCollapsed] = useState(false);

    // Drawing hook
    const drawing = useChartDrawing(symbol || 'default');

    const timeRanges = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'];

    // Load data
    useEffect(() => {
        async function loadData() {
            if (!symbol) return;
            setIsLoading(true);

            const [indexResult, marketResult] = await Promise.all([
                getIndexData(symbol, timeRange.toLowerCase()),
                getMarketSummary()
            ]);

            if (indexResult.data) {
                setIndexData(indexResult.data);
                setSelectedSymbol(indexResult.data);
            }

            if (marketResult.data) {
                setRelatedData({
                    indices: marketResult.data.indices || [],
                    stocks: marketResult.data.movers?.gainers || []
                });
            }

            setIsLoading(false);
        }
        loadData();
    }, [symbol, timeRange]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (textInput.show) return; // Don't capture when typing text

            const key = e.key.toUpperCase();
            const tool = drawingTools.find(t => t.shortcut === key);
            if (tool) {
                setActiveTool(tool.id);
                return;
            }

            if (e.ctrlKey && key === 'Z') {
                e.preventDefault();
                if (e.shiftKey) {
                    drawing.redo();
                } else {
                    drawing.undo();
                }
            }
            if (e.ctrlKey && key === 'S') {
                e.preventDefault();
                handleSave();
            }
            if (key === 'ESCAPE') {
                closeAllModals();
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // List of classes or IDs that should NOT close the modals when clicked
            const isClickInsideModal = target.closest('.popover-content') || target.closest('.popover-trigger');

            if (!isClickInsideModal) {
                closeAllModals();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [drawing, textInput.show]);

    const closeAllModals = () => {
        setShowSymbolSearch(false);
        setShowAlertModal(false);
        setShowChartType(false);
        setShowSaveMenu(false);
        setTextInput({ show: false, x: 0, y: 0, value: '' });
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Drawing handlers
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (lockDrawings || activeTool === 'cursor' || activeTool === 'crosshair') return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === 'text') {
            setTextInput({ show: true, x, y, value: '' });
            return;
        }

        if (activeTool === 'eraser') {
            // Find and remove drawing at this position
            const clickedObj = drawing.objects.find(obj => {
                // Handle text objects (single point)
                if (obj.type === 'text') {
                    const dist = Math.sqrt(
                        Math.pow(x - obj.points[0].x, 2) +
                        Math.pow(y - obj.points[0].y, 2)
                    );
                    return dist < 30; // Larger hit area for text
                }
                // Handle horizontal lines
                if (obj.type === 'horizontal') {
                    return Math.abs(y - obj.points[0].y) < 10;
                }
                // Handle vertical lines
                if (obj.type === 'vertical') {
                    return Math.abs(x - obj.points[0].x) < 10;
                }
                // Handle two-point objects (lines, rectangles, etc.)
                if (obj.points.length >= 2) {
                    const [p1, p2] = obj.points;
                    const distance = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
                    return distance < 10;
                }
                // Handle brush objects (multiple points)
                if (obj.type === 'brush' && obj.points.length > 0) {
                    return obj.points.some(p => {
                        const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                        return dist < 10;
                    });
                }
                return false;
            });
            if (clickedObj) {
                drawing.removeObject(clickedObj.id);
            }
            return;
        }

        drawing.startDrawing(activeTool as DrawingObject['type'], x, y);
    }, [activeTool, lockDrawings, drawing]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const preview = drawing.continueDrawing(x, y);
        if (preview) {
            setCurrentDrawingPreview({ ...preview });
        }
    }, [drawing]);

    const handleCanvasMouseUp = useCallback(() => {
        drawing.endDrawing();
        setCurrentDrawingPreview(null);
    }, [drawing]);

    const handleTextSubmit = () => {
        if (textInput.value.trim()) {
            drawing.addTextAnnotation(textInput.x, textInput.y, textInput.value);
        }
        setTextInput({ show: false, x: 0, y: 0, value: '' });
    };

    // Helper function for eraser
    const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Save function
    const handleSave = () => {
        drawing.saveToStorage();
        setShowSaveMenu(false);
        // Show brief confirmation
        const notification = document.createElement('div');
        notification.className = 'fixed top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium z-50';
        notification.textContent = 'Chart saved successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    };


    // Create alert
    const createAlert = () => {
        if (!alertPrice) return;
        const newAlert = {
            id: `alert_${Date.now()}`,
            price: parseFloat(alertPrice),
            condition: alertCondition,
        };
        setAlerts(prev => [...prev, newAlert]);
        setAlertPrice('');
        setShowAlertModal(false);
    };

    // Filter symbols
    const filteredSymbols = [...relatedData.indices, ...relatedData.stocks].filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render drawing
    const renderDrawing = (obj: DrawingObject, isPreview = false) => {
        const opacity = isPreview ? 0.6 : 1;
        const stroke = obj.color;

        switch (obj.type) {
            case 'trendline':
            case 'arrow':
                if (obj.points.length < 2) return null;
                return (
                    <g key={obj.id}>
                        <line
                            x1={obj.points[0].x}
                            y1={obj.points[0].y}
                            x2={obj.points[1].x}
                            y2={obj.points[1].y}
                            stroke={stroke}
                            strokeWidth={2}
                            opacity={opacity}
                            markerEnd={obj.type === 'arrow' ? 'url(#arrowhead)' : undefined}
                        />
                    </g>
                );
            case 'horizontal':
                if (obj.points.length < 1) return null;
                return (
                    <line
                        key={obj.id}
                        x1={0}
                        y1={obj.points[0].y}
                        x2="100%"
                        y2={obj.points[0].y}
                        stroke={stroke}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        opacity={opacity}
                    />
                );
            case 'vertical':
                if (obj.points.length < 1) return null;
                return (
                    <line
                        key={obj.id}
                        x1={obj.points[0].x}
                        y1={0}
                        x2={obj.points[0].x}
                        y2="100%"
                        stroke={stroke}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        opacity={opacity}
                    />
                );
            case 'rectangle':
                if (obj.points.length < 2) return null;
                const width = Math.abs(obj.points[1].x - obj.points[0].x);
                const height = Math.abs(obj.points[1].y - obj.points[0].y);
                const x = Math.min(obj.points[0].x, obj.points[1].x);
                const y = Math.min(obj.points[0].y, obj.points[1].y);
                return (
                    <rect
                        key={obj.id}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        stroke={stroke}
                        strokeWidth={2}
                        fill={stroke}
                        fillOpacity={0.1}
                        opacity={opacity}
                    />
                );
            case 'text':
                if (!obj.text || obj.points.length < 1) return null;
                return (
                    <g key={obj.id}>
                        <rect
                            x={obj.points[0].x - 2}
                            y={obj.points[0].y - 14}
                            width={(obj.text.length * 8) + 8}
                            height={20}
                            fill="rgba(0,0,0,0.6)"
                            rx={4}
                            opacity={opacity}
                        />
                        <text
                            x={obj.points[0].x + 2}
                            y={obj.points[0].y}
                            fill={obj.color}
                            fontSize={14}
                            fontWeight="bold"
                            opacity={opacity}
                        >
                            {obj.text}
                        </text>
                    </g>
                );
            case 'ruler':
                if (obj.points.length < 2) return null;
                const rulerDist = Math.sqrt(
                    Math.pow(obj.points[1].x - obj.points[0].x, 2) +
                    Math.pow(obj.points[1].y - obj.points[0].y, 2)
                );
                const midX = (obj.points[0].x + obj.points[1].x) / 2;
                const midY = (obj.points[0].y + obj.points[1].y) / 2;
                return (
                    <g key={obj.id}>
                        <line
                            x1={obj.points[0].x}
                            y1={obj.points[0].y}
                            x2={obj.points[1].x}
                            y2={obj.points[1].y}
                            stroke="#fbbf24"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            opacity={opacity}
                        />
                        <circle cx={obj.points[0].x} cy={obj.points[0].y} r={4} fill="#fbbf24" opacity={opacity} />
                        <circle cx={obj.points[1].x} cy={obj.points[1].y} r={4} fill="#fbbf24" opacity={opacity} />
                        <rect
                            x={midX - 25}
                            y={midY - 10}
                            width={50}
                            height={20}
                            fill="rgba(0,0,0,0.8)"
                            rx={4}
                            opacity={opacity}
                        />
                        <text
                            x={midX}
                            y={midY + 5}
                            fill="#fbbf24"
                            fontSize={12}
                            fontWeight="bold"
                            textAnchor="middle"
                            opacity={opacity}
                        >
                            {rulerDist.toFixed(0)}px
                        </text>
                    </g>
                );
            case 'brush':
                if (obj.points.length < 2) return null;
                const pathData = obj.points.reduce((path, point, i) =>
                    i === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`, ''
                );
                return (
                    <path
                        key={obj.id}
                        d={pathData}
                        stroke={stroke}
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={opacity}
                    />
                );
            default:
                return null;
        }
    };

    const data = indexData || {
        symbol: symbol || 'SPX',
        name: 'Loading...',
        price: 0,
        change: 0,
        changePercent: 0,
        chartData: []
    };

    const isPositive = data.change >= 0;

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            {/* Mobile Portrait Mode Overlay */}
            {isPortrait && (
                <div className="fixed inset-0 bg-brand-dark z-50 flex flex-col items-center justify-center p-8">
                    <RotateCcw className="h-16 w-16 text-blue-500 mb-6 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">Rotate Your Device</h2>
                    <p className="text-gray-400 text-center text-sm max-w-xs">
                        For the best charting experience, please rotate your device to landscape mode.
                    </p>
                </div>
            )}
            {/* Top Toolbar */}
            <div className="h-12 border-b border-white/5 bg-gray-900/50 flex items-center px-2 gap-1 relative z-30">
                {/* Left section - Symbol and controls */}
                <Link
                    to={`/indices/${symbol}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <Home className="h-4 w-4 text-gray-400" />
                </Link>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Symbol Search */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSymbolSearch(!showSymbolSearch); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors popover-trigger"
                    >
                        <Search className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-bold text-white">{symbol}</span>
                        <ChevronDown className="h-3 w-3 text-gray-500" />
                    </button>

                    {showSymbolSearch && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 popover-content">
                            <div className="p-2 border-b border-white/5">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search symbol..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {filteredSymbols.map((s) => (
                                    <button
                                        key={s.symbol}
                                        onClick={() => {
                                            navigate(`/chart/${s.symbol}`);
                                            setShowSymbolSearch(false);
                                            setSearchQuery('');
                                        }}
                                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-white">{s.symbol}</p>
                                            <p className="text-xs text-gray-500">{s.name}</p>
                                        </div>
                                        <span className={`text-xs font-medium ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chart Type */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowChartType(!showChartType); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white popover-trigger"
                    >
                        {chartTypes.find(t => t.id === chartType)?.icon &&
                            <span className="text-gray-400">
                                {(() => {
                                    const Icon = chartTypes.find(t => t.id === chartType)?.icon;
                                    return Icon ? <Icon className="h-4 w-4" /> : null;
                                })()}
                            </span>
                        }
                        <ChevronDown className="h-3 w-3" />
                    </button>

                    {showChartType && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 popover-content">
                            {chartTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setChartType(type.id);
                                        setShowChartType(false);
                                    }}
                                    className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors ${chartType === type.id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'}`}
                                >
                                    <type.icon className="h-4 w-4" />
                                    <span className="text-sm">{type.name}</span>
                                    {chartType === type.id && <Check className="h-3 w-3 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-white/10 mx-1" />



                {/* Alert */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowAlertModal(!showAlertModal); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white relative popover-trigger"
                >
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-medium">Alert</span>
                    {alerts.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{alerts.length}</span>
                    )}
                </button>

                {/* Alert Modal */}
                {showAlertModal && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 popover-content">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-sm font-medium text-white">Create Price Alert</span>
                            <button onClick={() => setShowAlertModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Condition</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setAlertCondition('above')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${alertCondition === 'above' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400'}`}
                                    >
                                        Price Above
                                    </button>
                                    <button
                                        onClick={() => setAlertCondition('below')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${alertCondition === 'below' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400'}`}
                                    >
                                        Price Below
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Target Price</label>
                                <input
                                    type="number"
                                    value={alertPrice}
                                    onChange={(e) => setAlertPrice(e.target.value)}
                                    placeholder={data.price.toFixed(2)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={createAlert}
                                disabled={!alertPrice}
                                className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Alert
                            </button>

                            {alerts.length > 0 && (
                                <div className="border-t border-white/5 pt-3 mt-3">
                                    <p className="text-xs text-gray-500 mb-2">Active Alerts</p>
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className="flex items-center justify-between py-1">
                                            <span className={`text-sm ${alert.condition === 'above' ? 'text-green-400' : 'text-red-400'}`}>
                                                {alert.condition === 'above' ? '↑' : '↓'} ${alert.price.toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                                className="text-gray-500 hover:text-red-400"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}



                {/* Undo/Redo */}
                <button
                    onClick={() => drawing.undo()}
                    disabled={!drawing.canUndo}
                    className={`p-1.5 rounded-lg transition-colors ${drawing.canUndo ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 cursor-not-allowed'}`}
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 className="h-4 w-4" />
                </button>

                <button
                    onClick={() => drawing.redo()}
                    disabled={!drawing.canRedo}
                    className={`p-1.5 rounded-lg transition-colors ${drawing.canRedo ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 cursor-not-allowed'}`}
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo2 className="h-4 w-4" />
                </button>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Save */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSaveMenu(!showSaveMenu); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white popover-trigger"
                    >
                        <Save className="h-4 w-4" />
                        <span className="text-xs font-medium">Save</span>
                        <ChevronDown className="h-3 w-3" />
                    </button>

                    {showSaveMenu && (
                        <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 popover-content">
                            <button
                                onClick={handleSave}
                                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                            >
                                <Save className="h-4 w-4" />
                                <span className="text-sm">Save Chart</span>
                            </button>
                            <button
                                onClick={() => { drawing.clearAll(); setShowSaveMenu(false); }}
                                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="text-sm">Clear Drawings</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Right section */}
                <div className="ml-auto flex items-center gap-1">

                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>


            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Drawing Tools */}
                <div className="w-12 border-r border-white/5 bg-gray-900/30 flex flex-col py-2">
                    {drawingTools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`p-2.5 mx-1 rounded-lg transition-all group relative ${activeTool === tool.id
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            title={`${tool.label} (${tool.shortcut})`}
                        >
                            <tool.icon className="h-4 w-4" />
                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {tool.label} <span className="text-gray-400">({tool.shortcut})</span>
                            </span>
                        </button>
                    ))}

                    <div className="my-2 mx-2 h-px bg-white/5" />

                    <button
                        onClick={() => setLockDrawings(!lockDrawings)}
                        className={`p-2.5 mx-1 rounded-lg transition-all group relative ${lockDrawings ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title="Lock Drawings"
                    >
                        <Lock className="h-4 w-4" />
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {lockDrawings ? 'Unlock Drawings' : 'Lock Drawings'}
                        </span>
                    </button>

                    <button
                        onClick={() => setShowDrawings(!showDrawings)}
                        className={`p-2.5 mx-1 rounded-lg transition-all group relative ${showDrawings ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title="Show Drawings"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {showDrawings ? 'Hide Drawings' : 'Show Drawings'}
                        </span>
                    </button>
                </div>

                {/* Chart Area */}
                <div className="flex-1 flex flex-col bg-brand-dark">
                    {/* Chart Header - Price Info */}
                    <div className="px-4 py-2 border-b border-white/5 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">{symbol}</span>
                            <span className="text-sm font-bold text-white">{data.name}</span>
                            <span className="text-xs text-gray-600">{timeRange}</span>
                            <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span>O<span className="text-white ml-1">{data.price.toFixed(2)}</span></span>
                            <span>H<span className="text-white ml-1">{(data.price * 1.002).toFixed(2)}</span></span>
                            <span>L<span className="text-white ml-1">{(data.price * 0.998).toFixed(2)}</span></span>
                            <span>C<span className="text-white ml-1">{data.price.toFixed(2)}</span></span>
                        </div>
                    </div>

                    {/* Main Chart with Drawing Canvas */}
                    <div className="flex-1 relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/50 z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        )}
                        <div className="h-full w-full p-4">
                            <PriceChart
                                data={data.chartData}
                                isPositive={isPositive}
                                chartType={chartType}
                                timeRange={timeRange}
                            />
                        </div>

                        {/* Drawing Canvas Overlay */}
                        <svg
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full pointer-events-auto"
                            style={{
                                cursor: activeTool === 'cursor' ? 'default' :
                                    activeTool === 'crosshair' ? 'crosshair' :
                                        activeTool === 'text' ? 'text' :
                                            activeTool === 'eraser' ? 'not-allowed' : 'crosshair'
                            }}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                        >
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                                </marker>
                            </defs>

                            {/* Render saved drawings */}
                            {showDrawings && drawing.objects.map(obj => renderDrawing(obj))}

                            {/* Render current drawing preview */}
                            {currentDrawingPreview && renderDrawing(currentDrawingPreview, true)}
                        </svg>

                        {/* Text Input */}
                        {textInput.show && (
                            <div
                                className="absolute"
                                style={{ left: textInput.x, top: textInput.y }}
                            >
                                <input
                                    type="text"
                                    value={textInput.value}
                                    onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleTextSubmit();
                                        if (e.key === 'Escape') setTextInput({ show: false, x: 0, y: 0, value: '' });
                                    }}
                                    onBlur={handleTextSubmit}
                                    placeholder="Enter text..."
                                    className="bg-gray-800 border border-blue-500 rounded px-2 py-1 text-white text-sm focus:outline-none min-w-[100px]"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Current Price Indicator */}
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                            <div className={`px-2 py-1 text-xs font-bold ${isPositive ? 'bg-blue-500' : 'bg-red-500'} text-white rounded-l`}>
                                {data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Time Range Selector */}
                    <div className="h-10 border-t border-white/5 flex items-center justify-between px-4">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600 mr-2">Trading Panel</span>
                        </div>

                        <div className="flex bg-white/5 p-0.5 rounded-lg">
                            {timeRanges.map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 text-xs font-bold uppercase transition-all rounded-md ${timeRange === range
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC</span>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Watchlist */}
                <div className="w-72 border-l border-white/5 bg-gray-900/30 flex flex-col">
                    {/* Watchlist Header */}
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                        <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-400 transition-colors">
                            Watchlist
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                        </button>
                    </div>

                    {/* Watchlist Table Header */}
                    <div className="px-3 py-2 grid grid-cols-4 gap-1 text-[10px] font-medium text-gray-600 border-b border-white/5">
                        <span>Symbol</span>
                        <span className="text-right">Last</span>
                        <span className="text-right">Chg</span>
                        <span className="text-right">Chg%</span>
                    </div>

                    {/* Watchlist Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Indices Section */}
                        <div className="border-b border-white/5">
                            <button
                                onClick={() => setIndicesCollapsed(!indicesCollapsed)}
                                className="w-full px-3 py-2 flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:bg-white/5"
                            >
                                {indicesCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                INDICES
                            </button>
                            {!indicesCollapsed && relatedData.indices.slice(0, 5).map((item) => (
                                <button
                                    key={item.symbol}
                                    onClick={() => {
                                        setSelectedSymbol(item);
                                        navigate(`/chart/${item.symbol}`);
                                    }}
                                    className={`w-full px-3 py-2 grid grid-cols-4 gap-1 text-xs hover:bg-white/5 transition-colors ${selectedSymbol?.symbol === item.symbol ? 'bg-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="font-medium text-white">{item.symbol}</span>
                                    </div>
                                    <span className="text-right text-gray-300">{item.price.toLocaleString()}</span>
                                    <span className={`text-right ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                                    </span>
                                    <span className={`text-right ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Stocks Section */}
                        <div className="border-b border-white/5">
                            <button
                                onClick={() => setStocksCollapsed(!stocksCollapsed)}
                                className="w-full px-3 py-2 flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:bg-white/5"
                            >
                                {stocksCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                STOCKS
                            </button>
                            {!stocksCollapsed && relatedData.stocks.slice(0, 3).map((item) => (
                                <button
                                    key={item.symbol}
                                    onClick={() => {
                                        setSelectedSymbol(item);
                                        navigate(`/chart/${item.symbol}`);
                                    }}
                                    className={`w-full px-3 py-2 grid grid-cols-4 gap-1 text-xs hover:bg-white/5 transition-colors ${selectedSymbol?.symbol === item.symbol ? 'bg-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="font-medium text-white">{item.symbol}</span>
                                    </div>
                                    <span className="text-right text-gray-300">{item.price.toLocaleString()}</span>
                                    <span className={`text-right ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                                    </span>
                                    <span className={`text-right ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Symbol Details */}
                    {selectedSymbol && (
                        <div className="border-t border-white/5 p-4">

                            <div className="mb-2">
                                <h3 className="text-lg font-bold text-white">{selectedSymbol.symbol}</h3>
                                <p className="text-xs text-gray-500">{selectedSymbol.name}</p>
                            </div>

                            <div className="mb-3">
                                <span className="text-[10px] font-medium text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                                    {selectedSymbol.exchange || 'Index'}
                                </span>
                            </div>

                            <div className="mb-2">
                                <p className="text-2xl font-bold text-white">
                                    {selectedSymbol.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    <span className="text-xs text-gray-500 ml-1">D</span>
                                </p>
                                <p className={`text-sm font-medium ${selectedSymbol.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {selectedSymbol.change >= 0 ? '+' : ''}{selectedSymbol.change.toFixed(2)} {selectedSymbol.change >= 0 ? '+' : ''}{selectedSymbol.changePercent.toFixed(2)}%
                                </p>
                                <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    Market open
                                </p>
                            </div>

                            {/* Performance */}
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Performance</h4>
                                <div className="grid grid-cols-3 gap-1">
                                    {[
                                        { label: '1W', value: '3.44%' },
                                        { label: '1M', value: '5.44%' },
                                        { label: '3M', value: '5.53%' },
                                        { label: '6M', value: '16.96%' },
                                        { label: 'YTD', value: '2.43%' },
                                        { label: '1Y', value: '27.23%' },
                                    ].map((perf) => (
                                        <div key={perf.label} className="text-center p-2 rounded bg-green-500/10">
                                            <p className="text-xs font-bold text-green-400">{perf.value}</p>
                                            <p className="text-[10px] text-gray-500">{perf.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
