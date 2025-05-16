// @ts-nocheck
"use client";

import type { ServiceOrder, ServiceType, BudgetItem } from "@/types/service-order";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useEffect } from "react";
import { Separator } from "./ui/separator";

const budgetItemSchema = z.object({
  id: z.string().optional(), // For existing items during edit
  description: z.string().min(1, "Descrição do item é obrigatória."),
  quantity: z.coerce.number().positive({ message: "Quantidade deve ser um número positivo." }).min(0.001, "Quantidade deve ser positiva."),
  unitPrice: z.coerce.number().min(0, "Preço unitário deve ser zero ou positivo."),
});

type BudgetItemFormData = z.infer<typeof budgetItemSchema>;

const serviceOrderSchema = z.object({
  customerName: z.string().min(2, "Nome do cliente é obrigatório."),
  customerPhone: z.string().min(10, "Telefone é obrigatório."),
  customerAddress: z.string().optional(),
  serviceDescription: z.string().min(5, "Descrição do serviço é obrigatória."),
  serviceType: z.enum(["conserto_bomba", "restauracao_bico"], {
    required_error: "Tipo de serviço é obrigatório.",
  }),
  budgetItems: z.array(budgetItemSchema).optional().default([]),
  budgetAmount: z.coerce.number().min(0, "Orçamento deve ser positivo ou zero."),
  amountPaid: z.coerce.number().min(0, "Valor pago deve ser positivo ou zero.").optional().default(0),
  creationDate: z.date({ required_error: "Data de criação é obrigatória." }),
  serviceStartDate: z.date().optional(),
  completionDate: z.date().optional(),
  paymentDate: z.date().optional(),
});

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

interface ServiceOrderFormProps {
  onSubmit: (data: ServiceOrderFormData) => void;
  initialData?: Partial<ServiceOrder>;
  isLoading?: boolean;
}

export function ServiceOrderForm({
  onSubmit,
  initialData,
  isLoading,
}: ServiceOrderFormProps) {
  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      customerName: initialData?.customerName || "",
      customerPhone: initialData?.customerPhone || "",
      customerAddress: initialData?.customerAddress || "",
      serviceDescription: initialData?.serviceDescription || "",
      serviceType: initialData?.serviceType,
      budgetItems: initialData?.budgetItems?.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) || [],
      budgetAmount: initialData?.budgetAmount || 0,
      amountPaid: initialData?.amountPaid || 0,
      creationDate: initialData?.creationDate ? new Date(initialData.creationDate) : new Date(),
      serviceStartDate: initialData?.serviceStartDate ? new Date(initialData.serviceStartDate) : undefined,
      completionDate: initialData?.completionDate ? new Date(initialData.completionDate) : undefined,
      paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate) : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "budgetItems",
  });

  const budgetItemsValues = form.watch('budgetItems');

  useEffect(() => {
    let total = 0;
    if (budgetItemsValues) {
      total = budgetItemsValues.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return sum + (quantity * unitPrice);
      }, 0);
    }
    form.setValue('budgetAmount', total, { shouldValidate: true, shouldDirty: true });
  }, [budgetItemsValues, form]);


  const serviceTypeOptions: { label: string; value: ServiceType }[] = [
    { label: "Conserto de Bomba", value: "conserto_bomba" },
    { label: "Restauração de Bico", value: "restauracao_bico" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer and Service Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: (11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="customerAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Rua das Palmeiras, 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Geral do Serviço</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes gerais do serviço a ser realizado..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Serviço Principal</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <Separator className="my-8" />

        {/* Budget Items Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-primary">Itens do Orçamento</h3>
          {fields.map((field, index) => {
            const quantity = form.watch(`budgetItems.${index}.quantity`);
            const unitPrice = form.watch(`budgetItems.${index}.unitPrice`);
            const itemTotal = (Number(quantity) || 0) * (Number(unitPrice) || 0);

            return (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 mb-3 border rounded-md shadow-sm">
                <span className="md:col-span-1 text-sm font-medium text-gray-700 self-center">#{index + 1}</span>
                <FormField
                  control={form.control}
                  name={`budgetItems.${index}.description`}
                  render={({ field: f }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel className="text-xs">Descrição do Item</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Troca de pastilhas" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`budgetItems.${index}.quantity`}
                  render={({ field: f }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs">Qtde.</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`budgetItems.${index}.unitPrice`}
                  render={({ field: f }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs">Vlr. Unit. (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="50.00" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2 flex flex-col items-start">
                    <FormLabel className="text-xs">Vlr. Total (R$)</FormLabel>
                    <span className="text-sm font-semibold h-10 flex items-center">
                        {itemTotal.toFixed(2)}
                    </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  className="md:col-span-1 h-10 w-10"
                  aria-label="Remover item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Item
          </Button>
        </div>
        
        <Separator className="my-8" />

        {/* Totals and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <FormLabel>Valor Total do Orçamento (R$)</FormLabel>
            <p className="text-2xl font-bold text-primary h-10 flex items-center">
              R$ {form.watch('budgetAmount').toFixed(2)}
            </p>
            {/* Hidden input to carry the budgetAmount, as FormField for it was removed */}
             <FormField
                control={form.control}
                name="budgetAmount"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="number" {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
          <FormField
            control={form.control}
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Já Pago (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator className="my-8" />
        
        {/* Dates Section */}
        <h3 className="text-lg font-medium mb-4 text-primary">Datas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="creationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Criação do Orçamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Início Atendimento (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="completionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Conclusão (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Pagamento (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar Ordem de Serviço"}
        </Button>
      </form>
    </Form>
  );
}
