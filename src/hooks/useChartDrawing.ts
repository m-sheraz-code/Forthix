import { useState, useCallback, useRef } from 'react';

// Drawing object types
export interface DrawingObject {
    id: string;
    type: 'trendline' | 'horizontal' | 'vertical' | 'rectangle' | 'text' | 'arrow' | 'brush' | 'ruler';
    points: { x: number; y: number }[];
    color: string;
    text?: string;
}

export interface DrawingState {
    objects: DrawingObject[];
    undoStack: DrawingObject[][];
    redoStack: DrawingObject[][];
}

const STORAGE_KEY = 'forthix_chart_drawings';

export function useChartDrawing(symbol: string) {
    // Load initial state from localStorage
    const getInitialState = (): DrawingObject[] => {
        try {
            const stored = localStorage.getItem(`${STORAGE_KEY}_${symbol}`);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const [objects, setObjects] = useState<DrawingObject[]>(getInitialState);
    const [undoStack, setUndoStack] = useState<DrawingObject[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingObject[][]>([]);
    const isDrawing = useRef(false);
    const currentDrawing = useRef<DrawingObject | null>(null);

    // Generate unique ID
    const generateId = () => `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save to localStorage
    const saveToStorage = useCallback((newObjects: DrawingObject[]) => {
        try {
            localStorage.setItem(`${STORAGE_KEY}_${symbol}`, JSON.stringify(newObjects));
        } catch (e) {
            console.error('Failed to save drawings:', e);
        }
    }, [symbol]);

    // Add drawing object
    const addObject = useCallback((obj: DrawingObject) => {
        setUndoStack(prev => [...prev, objects]);
        setRedoStack([]);
        const newObjects = [...objects, obj];
        setObjects(newObjects);
        saveToStorage(newObjects);
    }, [objects, saveToStorage]);

    // Remove drawing object
    const removeObject = useCallback((id: string) => {
        setUndoStack(prev => [...prev, objects]);
        setRedoStack([]);
        const newObjects = objects.filter(obj => obj.id !== id);
        setObjects(newObjects);
        saveToStorage(newObjects);
    }, [objects, saveToStorage]);

    // Clear all drawings
    const clearAll = useCallback(() => {
        setUndoStack(prev => [...prev, objects]);
        setRedoStack([]);
        setObjects([]);
        saveToStorage([]);
    }, [objects, saveToStorage]);

    // Undo
    const undo = useCallback(() => {
        if (undoStack.length === 0) return;
        const previousState = undoStack[undoStack.length - 1];
        setRedoStack(prev => [...prev, objects]);
        setUndoStack(prev => prev.slice(0, -1));
        setObjects(previousState);
        saveToStorage(previousState);
    }, [undoStack, objects, saveToStorage]);

    // Redo
    const redo = useCallback(() => {
        if (redoStack.length === 0) return;
        const nextState = redoStack[redoStack.length - 1];
        setUndoStack(prev => [...prev, objects]);
        setRedoStack(prev => prev.slice(0, -1));
        setObjects(nextState);
        saveToStorage(nextState);
    }, [redoStack, objects, saveToStorage]);

    // Start drawing
    const startDrawing = useCallback((
        type: DrawingObject['type'],
        x: number,
        y: number,
        color: string = '#3b82f6'
    ) => {
        isDrawing.current = true;
        currentDrawing.current = {
            id: generateId(),
            type,
            points: [{ x, y }],
            color,
        };
    }, []);

    // Continue drawing
    const continueDrawing = useCallback((x: number, y: number) => {
        if (!isDrawing.current || !currentDrawing.current) return null;

        const type = currentDrawing.current.type;

        if (type === 'brush') {
            // Brush adds multiple points
            currentDrawing.current.points.push({ x, y });
        } else {
            // Other tools update end point
            if (currentDrawing.current.points.length === 1) {
                currentDrawing.current.points.push({ x, y });
            } else {
                currentDrawing.current.points[1] = { x, y };
            }
        }

        return { ...currentDrawing.current };
    }, []);

    // End drawing
    const endDrawing = useCallback(() => {
        if (!isDrawing.current || !currentDrawing.current) return;

        // Only add if there are at least 2 points (or points for brush)
        if (currentDrawing.current.points.length >= 2 ||
            (currentDrawing.current.type === 'brush' && currentDrawing.current.points.length > 0)) {
            addObject(currentDrawing.current);
        }

        isDrawing.current = false;
        currentDrawing.current = null;
    }, [addObject]);

    // Add text annotation
    const addTextAnnotation = useCallback((x: number, y: number, text: string, color: string = '#ffffff') => {
        const textObj: DrawingObject = {
            id: generateId(),
            type: 'text',
            points: [{ x, y }],
            color,
            text,
        };
        addObject(textObj);
    }, [addObject]);

    return {
        objects,
        isDrawing: isDrawing.current,
        currentDrawing: currentDrawing.current,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        startDrawing,
        continueDrawing,
        endDrawing,
        addTextAnnotation,
        removeObject,
        clearAll,
        undo,
        redo,
        saveToStorage: () => saveToStorage(objects),
    };
}
