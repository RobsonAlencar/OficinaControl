"use client";

import type { ServiceOrder, ServiceStatus } from "@/types/service-order";
import { ServiceOrderCard } from "./service-order-card";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, ListFilter, Search, ArrowDownUp, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  onEditOrder: (order: ServiceOrder) => void;
  onViewOrderDetails: (order: ServiceOrder) => void;
}

type SortKey = "creationDate" | "customerName" | "budgetAmount" | "status";
type SortDirection = "asc" | "desc";

export function ServiceOrderList({
  orders,
  onEditOrder,
  onViewOrderDetails,
}: ServiceOrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "uncompleted">(
    "uncompleted"
  );
  const [sortKey, setSortKey] = useState<SortKey>("creationDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const statusOptions: { label: string; value: ServiceStatus | "uncompleted" }[] = [
    { label: "Todos os Status", value: "all" },
    { label: "Pendente", value: "pending" },
    { label: "Em Progresso", value: "in_progress" },
    { label: "Concluído", value: "completed" },
    { label: "Não Concluídas", value: "uncompleted" },
    { label: "Pago", value: "paid" },
  ];

  const sortOptions: { label: string; key: SortKey }[] = [
    { label: "Data de Criação", key: "creationDate" },
    { label: "Nome do Cliente", key: "customerName" },
    { label: "Valor do Orçamento", key: "budgetAmount" },
    { label: "Status", key: "status" },
  ];

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term) ||
        order.serviceDescription.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term)
      );
    });

    if (statusFilter === "uncompleted")  {
      filtered = filtered.filter((order) => order.status == "pending" || order.status == "in_progress");
    } else if (statusFilter !== "all") { 
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === "creationDate") {
        valA = new Date(a.creationDate).getTime();
        valB = new Date(b.creationDate).getTime();
      }

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }
      return sortDirection === "asc" ? comparison : comparison * -1;
    });
  }, [orders, searchTerm, statusFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortKey("creationDate");
    setSortDirection("desc");
  };


  return (
    <div className="space-y-6">
      <div className="bg-card p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, telefone, OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ServiceStatus | "all")}
          >
            <SelectTrigger className="w-full">
               <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex-grow">
                  <ArrowDownUp className="mr-2 h-4 w-4" />
                  Ordenar Por
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.key}
                    onClick={() => handleSort(option.key)}
                    className={sortKey === option.key ? "bg-accent text-accent-foreground" : ""}
                  >
                    {option.label}
                    {sortKey === option.key && (
                      <span className="ml-auto text-xs">
                        ({sortDirection === "asc" ? "ASC" : "DESC"})
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="ghost" onClick={clearFilters} size="icon" aria-label="Limpar filtros">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredAndSortedOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedOrders.map((order) => (
            <ServiceOrderCard
              key={order.id}
              order={order}
              onEdit={onEditOrder}
              onViewDetails={onViewOrderDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-semibold text-foreground">
            Nenhuma ordem de serviço encontrada.
          </p>
          <p className="text-muted-foreground">
            Tente ajustar seus filtros ou crie uma nova ordem de serviço.
          </p>
        </div>
      )}
    </div>
  );
}
