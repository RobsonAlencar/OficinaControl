"use client";

import type { ServiceOrder, ServiceStatus, ServiceType } from "@/types/service-order";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, Edit, Eye, HardHat, MessageSquareWarning, PackageCheck, Wrench, History, CheckCircle2, DollarSign, Phone, User, MapPin, Hammer, Settings2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onEdit: (order: ServiceOrder) => void;
  onViewDetails: (order: ServiceOrder) => void;
}

const getStatusInfo = (status: ServiceStatus): { label: string; icon: React.ElementType; colorClass: string } => {
  switch (status) {
    case "pending":
      return { label: "Pendente", icon: History, colorClass: "bg-yellow-500 hover:bg-yellow-600" };
    case "in_progress":
      return { label: "Em Progresso", icon: HardHat, colorClass: "bg-blue-500 hover:bg-blue-600" };
    case "completed":
      return { label: "Concluído", icon: CheckCircle2, colorClass: "bg-green-500 hover:bg-green-600" };
    case "paid":
      return { label: "Pago", icon: DollarSign, colorClass: "bg-teal-500 hover:bg-teal-600" };
    default:
      return { label: "Desconhecido", icon: MessageSquareWarning, colorClass: "bg-gray-500 hover:bg-gray-600" };
  }
};

const getServiceTypeInfo = (type: ServiceType): { label: string; icon: React.ElementType } => {
  switch (type) {
    case "conserto_bomba":
      return { label: "Conserto de Bomba", icon: Settings2 };
    case "restauracao_bico":
      return { label: "Restauração de Bico", icon: Hammer };
    default:
      return { label: "Serviço", icon: Wrench };
  }
};

const formatDateSafe = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return "Data Inválida";
  }
};


export function ServiceOrderCard({ order, onEdit, onViewDetails }: ServiceOrderCardProps) {
  const statusInfo = getStatusInfo(order.status);
  const serviceTypeInfo = getServiceTypeInfo(order.serviceType);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <serviceTypeInfo.icon className="mr-2 h-5 w-5 text-accent" />
              {serviceTypeInfo.label}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              OS #{order.id.substring(0, 6)}...
            </CardDescription>
          </div>
          <Badge className={`${statusInfo.colorClass} text-white text-xs`}>
            <statusInfo.icon className="mr-1 h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{order.customerName}</span>
        </div>
        <div className="flex items-center text-sm">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{order.customerPhone}</span>
        </div>
        {order.customerAddress && (
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{order.customerAddress}</span>
          </div>
        )}
        <p className="text-sm text-foreground italic line-clamp-2">
          "{order.serviceDescription}"
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm pt-2">
          <div>
            <span className="font-semibold">Orçamento: </span>
            R$ {order.budgetAmount.toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Pago: </span>
            R$ {order.amountPaid.toFixed(2)}
          </div>
          <div>
            <span className="font-semibold">Criado em: </span>
            {formatDateSafe(order.creationDate)}
          </div>
          {order.completionDate && (
            <div>
              <span className="font-semibold">Concluído em: </span>
               {formatDateSafe(order.completionDate)}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 pt-3">
          <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
            <Eye className="mr-1 h-4 w-4" />
            Detalhes
          </Button>
          <Button variant="default" size="sm" onClick={() => onEdit(order)} className="bg-accent hover:bg-accent/90">
            <Edit className="mr-1 h-4 w-4" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
