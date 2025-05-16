export type ServiceType = "conserto_bomba" | "restauracao_bico";
export type ServiceStatus = "pending" | "in_progress" | "completed" | "paid" | "uncompleted" | "all" ;

export interface BudgetItem {
  id: string; // Unique identifier for the budget item
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // Calculated: quantity * unitPrice
}

export interface ServiceOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  serviceDescription: string;
  serviceType: ServiceType;
  budgetAmount: number; // Overall budget amount, sum of budgetItems.totalPrice
  budgetItems: BudgetItem[]; // List of items in the budget
  amountPaid: number;
  creationDate: string; // ISO String
  serviceStartDate?: string; // ISO String
  completionDate?: string; // ISO String
  paymentDate?: string; // ISO String
  status: ServiceStatus;
}

