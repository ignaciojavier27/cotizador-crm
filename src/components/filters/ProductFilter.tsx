"use client";

import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ProductFiltersProps } from "@/types/product";


export function ProductFilters({
    onSearch,
    onFilterStatus,
    onFilterCategory,
    onClearFilters,
    categories = [],
    currentFilters,
    totalProducts,
}: ProductFiltersProps) {
    const [searchTerm, setSearchTerm] = useState(currentFilters.search || "");
    const [selectedStatus, setSelectedStatus] = useState<string>(
        currentFilters.isActive === null || currentFilters.isActive === undefined
            ? "all"
            : currentFilters.isActive
            ? "active"
            : "inactive"
    );
    const [selectedCategory, setSelectedCategory] = useState<string>(
        currentFilters.categoryId || "all"
    );
    const [isOpen, setIsOpen] = useState(false);

    // Debounce para el buscador
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== currentFilters.search) {
                onSearch(searchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch, currentFilters.search]);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        
        if (status === "all") {
            onFilterStatus(null);
        } else if (status === "active") {
            onFilterStatus(true);
        } else {
            onFilterStatus(false);
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        onFilterCategory(categoryId === "all" ? "" : categoryId);
    };

    const handleClearAll = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        setSelectedCategory("all");
        onClearFilters();
        setIsOpen(false);
    };

    const activeFiltersCount = [
        searchTerm,
        selectedStatus !== "all",
        selectedCategory !== "all"
    ].filter(Boolean).length;

    const hasActiveFilters = activeFiltersCount > 0;

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda y filtros */}
            <div className="flex gap-2">
                {/* Input de búsqueda */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Buscar productos por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Botón de filtros avanzados (Sheet) */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filtros
                            {hasActiveFilters && (
                                <Badge 
                                    variant="default" 
                                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                                >
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filtros de búsqueda</SheetTitle>
                            <SheetDescription>
                                Filtra los productos según tus necesidades
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-6">
                            {/* Filtro por estado */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado del producto</Label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="active">
                                            <div className="flex items-center">
                                                <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                                                Activos
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            <div className="flex items-center">
                                                <div className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                                                Inactivos
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {/* Filtro por categoría */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Select
                                    value={selectedCategory}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            {/* Resumen de filtros activos */}
                            {hasActiveFilters && (
                                <div className="space-y-3">
                                    <Label>Filtros activos</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {searchTerm && (
                                            <Badge variant="secondary">
                                                Búsqueda: &quot;{searchTerm}&quot;
                                            </Badge>
                                        )}
                                        {selectedStatus !== "all" && (
                                            <Badge variant="secondary">
                                                {selectedStatus === "active" ? "Activos" : "Inactivos"}
                                            </Badge>
                                        )}
                                        {selectedCategory !== "all" && (
                                            <Badge variant="secondary">
                                                {categories.find(c => c.id === selectedCategory)?.name || "Categoría"}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleClearAll}
                                    disabled={!hasActiveFilters}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Limpiar
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Resumen de resultados */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {totalProducts} {totalProducts === 1 ? "producto" : "productos"} 
                    {hasActiveFilters && " encontrado"}
                    {hasActiveFilters && totalProducts !== 1 && "s"}
                </p>
                
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="h-8"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}