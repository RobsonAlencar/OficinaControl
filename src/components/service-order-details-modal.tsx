// @ts-nocheck
"use client";

import type { ServiceOrder, ServiceStatus, ServiceType, BudgetItem } from "@/types/service-order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, DollarSignIcon, Edit, HardHat, History, MessageSquareWarning, User, Phone, MapPin, Wrench, Settings2, Hammer, FileText, Tag, Milestone, Banknote, Clock, CircleDollarSign, FileDown, ListOrdered } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For PDF tables

interface ServiceOrderDetailsModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: ServiceOrder) => void;
}

const getStatusInfo = (status: ServiceStatus): { label: string; icon: React.ElementType; badgeVariant: "default" | "secondary" | "destructive" | "outline" } => {
  switch (status) {
    case "pending":
      return { label: "Pendente", icon: History, badgeVariant: "default" }; 
    case "in_progress":
      return { label: "Em Progresso", icon: HardHat, badgeVariant: "default" }; 
    case "completed":
      return { label: "Concluído", icon: CheckCircle2, badgeVariant: "default" }; 
    case "paid":
      return { label: "Pago", icon: DollarSignIcon, badgeVariant: "secondary" }; 
    default:
      return { label: "Desconhecido", icon: MessageSquareWarning, badgeVariant: "outline" };
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

const formatDateSafe = (dateString?: string, includeTime: boolean = false) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), includeTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    return "Data Inválida";
  }
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) => (
  <div className="flex items-start py-2">
    <Icon className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value || "N/A"}</p>
    </div>
  </div>
);

const BudgetItemRow = ({ item, index }: { item: BudgetItem; index: number }) => (
  <div className="grid grid-cols-12 gap-2 py-2 border-b border-muted last:border-b-0">
    <div className="col-span-1 text-sm text-muted-foreground">#{index + 1}</div>
    <div className="col-span-5 text-sm text-foreground">{item.description}</div>
    <div className="col-span-2 text-sm text-foreground text-right">{item.quantity}</div>
    <div className="col-span-2 text-sm text-foreground text-right">R$ {item.unitPrice.toFixed(2)}</div>
    <div className="col-span-2 text-sm font-semibold text-foreground text-right">R$ {item.totalPrice.toFixed(2)}</div>
  </div>
);


export function ServiceOrderDetailsModal({
  order,
  isOpen,
  onClose,
  onEdit,
}: ServiceOrderDetailsModalProps) {
  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const serviceTypeInfo = getServiceTypeInfo(order.serviceType);
  const safeBudgetItems = order.budgetItems || [];


  const generateCSV = () => {
    if (!order) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header for Order Details
    const orderHeaders = ["Nome do Cliente", "Tipo do Serviço", "Descrição Geral", "Valor Total Orçamento", "Data de Criação"];
    const orderData = [
      order.customerName,
      serviceTypeInfo.label,
      order.serviceDescription,
      order.budgetAmount.toFixed(2),
      formatDateSafe(order.creationDate)
    ];
    csvContent += orderHeaders.join(",") + "\n";
    csvContent += orderData.map(e => `"${String(e).replace(/"/g, '""')}"`).join(",") + "\n\n";

    // Header for Budget Items
    if (safeBudgetItems.length > 0) {
      const itemHeaders = ["Item No.", "Descrição Item", "Quantidade", "Valor Unitário", "Valor Total Item"];
      csvContent += itemHeaders.join(",") + "\n";
      safeBudgetItems.forEach((item, index) => {
        const itemData = [
          index + 1,
          item.description,
          item.quantity,
          item.unitPrice.toFixed(2),
          item.totalPrice.toFixed(2),
        ];
        csvContent += itemData.map(e => `"${String(e).replace(/"/g, '""')}"`).join(",") + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orcamento_${order.id.substring(0,6)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    if (!order) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Orçamento da Ordem de Serviço", 14, 22);
    doc.setFontSize(11);
    doc.text(`OS #${order.id.substring(0,8)}...`, 14, 30);

    let yPos = 40;
    const lineHeight = 7;
    const leftMargin = 14;

    doc.setFontSize(12);

    doc.text("Nome do Cliente:", leftMargin, yPos);
    doc.text(order.customerName, leftMargin + 50, yPos);
    yPos += lineHeight;

    doc.text("Tipo do Serviço:", leftMargin, yPos);
    doc.text(serviceTypeInfo.label, leftMargin + 50, yPos);
    yPos += lineHeight;
    
    doc.text("Data de Criação:", leftMargin, yPos);
    doc.text(formatDateSafe(order.creationDate), leftMargin + 50, yPos);
    yPos += lineHeight;

    doc.text("Descrição Geral:", leftMargin, yPos);
    const descriptionLines = doc.splitTextToSize(order.serviceDescription, doc.internal.pageSize.width - leftMargin - (leftMargin + 50)); // Adjust width for description
    doc.text(descriptionLines, leftMargin + 50, yPos);
    yPos += lineHeight * descriptionLines.length + 5; // Add extra space after description
    
    if (safeBudgetItems.length > 0) {
      doc.setFontSize(14);
      doc.text("Itens do Orçamento:", leftMargin, yPos);
      yPos += lineHeight + 2;
      
      const tableColumn = ["No.", "Descrição", "Qtde.", "Vlr. Unit.", "Vlr. Total"];
      const tableRows = safeBudgetItems.map((item, index) => [
        index + 1,
        item.description,
        item.quantity.toString(),
        `R$ ${item.unitPrice.toFixed(2)}`,
        `R$ ${item.totalPrice.toFixed(2)}`,
      ]);

      (doc as any).autoTable({ // Cast to any to avoid type errors with jspdf-autotable
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] }, // Example: Teal color for header
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 10 }, // No.
          1: { cellWidth: 'auto' }, // Descrição
          2: { cellWidth: 15, halign: 'right' }, // Qtde.
          3: { cellWidth: 30, halign: 'right' }, // Vlr. Unit.
          4: { cellWidth: 30, halign: 'right' }, // Vlr. Total
        }
      });
      yPos = (doc as any).lastAutoTable.finalY + lineHeight; // Update yPos after table
    }
    
    doc.setFontSize(12);
    doc.text("Valor Total do Orçamento:", leftMargin, yPos);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`R$ ${order.budgetAmount.toFixed(2)}`, leftMargin + 60, yPos);
    doc.setFont(undefined, 'normal');
    
    doc.save(`orcamento_${order.id.substring(0,6)}.pdf`);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-bold text-primary flex items-center">
            <FileText className="mr-3 h-7 w-7" />
            Detalhes da Ordem de Serviço #{order.id.substring(0, 8)}...
          </DialogTitle>
          <DialogDescription>
            Visualização completa das informações da ordem de serviço.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6 mb-2 overflow-auto" >
          <div className="space-y-4 my-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Status e Tipo
              </h3>
              <Badge variant={statusInfo.badgeVariant} className={`text-sm py-1 px-3 ${
                  statusInfo.label === "Pendente" ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                  statusInfo.label === "Em Progresso" ? "bg-blue-500 hover:bg-blue-600 text-white" :
                  statusInfo.label === "Concluído" ? "bg-green-500 hover:bg-green-600 text-white" :
                  statusInfo.label === "Pago" ? "bg-teal-500 hover:bg-teal-600 text-white" :
                  "bg-gray-500 hover:bg-gray-600 text-white" // Default or Desconhecido
                }`}>
                <statusInfo.icon className="mr-2 h-4 w-4" />
                {statusInfo.label}
              </Badge>
            </div>
            <DetailItem icon={serviceTypeInfo.icon} label="Tipo de Serviço" value={serviceTypeInfo.label} />
            
            <Separator className="my-4"/>

            <h3 className="text-lg font-semibold text-primary flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <DetailItem icon={User} label="Nome do Cliente" value={order.customerName} />
                <DetailItem icon={Phone} label="Telefone" value={order.customerPhone} />
            </div>
            <div>
              {order.customerAddress && (
                <DetailItem icon={MapPin} label="Endereço" value={order.customerAddress} />
              )}
            </div>
            
            <Separator className="my-4"/>

            <h3 className="text-lg font-semibold text-primary flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Detalhes Gerais do Serviço
            </h3>
            <DetailItem icon={FileText} label="Descrição Geral do Serviço" value={order.serviceDescription} />

            <Separator className="my-4"/>

             <h3 className="text-lg font-semibold text-primary flex items-center">
                <ListOrdered className="mr-2 h-5 w-5" />
                Itens do Orçamento
            </h3>
            {safeBudgetItems.length > 0 ? (
              <div className="border border-border rounded-md p-4">
                <div className="grid grid-cols-12 gap-2 font-semibold text-sm text-muted-foreground pb-2 border-b border-border">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Descrição</div>
                  <div className="col-span-2 text-right">Qtde.</div>
                  <div className="col-span-2 text-right">Vlr. Unit.</div>
                  <div className="col-span-2 text-right">Vlr. Total</div>
                </div>
                {safeBudgetItems.map((item, index) => (
                  <BudgetItemRow key={item.id || index} item={item} index={index} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum item de orçamento cadastrado.</p>
            )}

            <Separator className="my-4"/>
            
            <h3 className="text-lg font-semibold text-primary flex items-center">
                <DollarSignIcon className="mr-2 h-5 w-5" />
                Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <DetailItem icon={Banknote} label="Valor Total do Orçamento" value={`R$ ${order.budgetAmount.toFixed(2)}`} />
                <DetailItem icon={CircleDollarSign} label="Valor Pago" value={`R$ ${order.amountPaid.toFixed(2)}`} />
            </div>
            
            <Separator className="my-4"/>
            
            <h3 className="text-lg font-semibold text-primary flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Datas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <DetailItem icon={Clock} label="Data de Criação" value={formatDateSafe(order.creationDate, true)} />
                <DetailItem icon={Milestone} label="Início do Atendimento" value={formatDateSafe(order.serviceStartDate)} />
                <DetailItem icon={CheckCircle2} label="Data de Conclusão" value={formatDateSafe(order.completionDate)} />
                <DetailItem icon={DollarSignIcon} label="Data de Pagamento" value={formatDateSafe(order.paymentDate)} />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 pb-6 bottom-0 bg-background pt-4 border-t flex-wrap justify-between sm:justify-end">
          <div className="flex gap-2 mb-2 sm:mb-0">
            <Button variant="outline" onClick={generateCSV} size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Gerar CSV
            </Button>
            <Button variant="outline" onClick={generatePDF} size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Gerar PDF
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
                Fechar
            </Button>
            <Button onClick={() => { onEdit(order); onClose(); }} className="bg-accent hover:bg-accent/90" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar Ordem
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


