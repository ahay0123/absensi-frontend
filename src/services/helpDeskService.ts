import axios from "@/lib/axios";

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: "Open" | "In-progress" | "Closed";
  priority: "Low" | "Mid" | "High";
  reporter_id: number;
  operator_id: number | null;
  created_at: string;
  updated_at: string;
  first_response_at: string | null;
  resolved_at: string | null;
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  responder_id: number;
  message: string;
  is_auto_reply: boolean;
  created_at: string;
  updated_at: string;
  responder?: any;
}

export interface SatisfactionRating {
  id: number;
  ticket_id: number;
  score: 1 | 2 | 3 | 4 | 5;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

// Guru/Reporter endpoints
export async function createTicket(data: {
  subject: string;
  description: string;
  priority: string;
  check_duplicates?: boolean;
}) {
  const response = await axios.post("/helpdesk/tickets", data);
  return response.data;
}

export async function getMyTickets(params?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const response = await axios.get("/helpdesk/tickets", { params });
  return response.data;
}

export async function getTicketDetail(id: number) {
  const response = await axios.get(`/helpdesk/tickets/${id}`);
  return response.data;
}

export async function respondToTicket(ticketId: number, message: string) {
  const response = await axios.post(`/helpdesk/tickets/${ticketId}/responses`, {
    message,
  });
  return response.data;
}

export async function checkDuplicates(data: {
  subject: string;
  description: string;
}) {
  const response = await axios.get("/helpdesk/tickets/check-duplicates", {
    params: data,
  });
  return response.data;
}

export async function closeTicket(id: number) {
  const response = await axios.put(`/helpdesk/tickets/${id}`, {
    status: "Closed",
  });
  return response.data;
}

export async function rateTicket(
  ticketId: number,
  data: {
    score: 1 | 2 | 3 | 4 | 5;
    feedback?: string;
  },
) {
  // This will be called after ticket is closed
  // Endpoint: POST /helpdesk/tickets/{id}/rate
  const response = await axios.post(`/helpdesk/tickets/${ticketId}/rate`, data);
  return response.data;
}

// Admin endpoints
export async function getAllTickets(params?: any) {
  const response = await axios.get("/admin/helpdesk/tickets", { params });
  return response.data;
}

export async function getTicketDetailAdmin(id: number) {
  const response = await axios.get(`/admin/helpdesk/tickets/${id}`);
  return response.data;
}

export async function updateTicket(id: number, data: any) {
  const response = await axios.put(`/admin/helpdesk/tickets/${id}`, data);
  return response.data;
}

export async function respondAsAdmin(
  ticketId: number,
  message: string,
  isAutoReply: boolean = false,
) {
  const response = await axios.post(
    `/admin/helpdesk/tickets/${ticketId}/responses`,
    {
      message,
      is_auto_reply: isAutoReply,
    },
  );
  return response.data;
}

export async function getAutoReplySuggestions(ticketId: number) {
  const response = await axios.get(
    `/admin/helpdesk/tickets/${ticketId}/suggestions`,
  );
  return response.data;
}

export async function bulkUpdateTickets(data: {
  ticket_ids: number[];
  status?: string;
  priority?: string;
  operator_id?: number;
}) {
  const response = await axios.post(
    "/admin/helpdesk/tickets/bulk-update",
    data,
  );
  return response.data;
}

export async function deleteTicket(id: number) {
  const response = await axios.delete(`/admin/helpdesk/tickets/${id}`);
  return response.data;
}

// Kepala Sekolah endpoints
export async function getHelpDeskAnalytics(params?: {
  start_date?: string;
  end_date?: string;
  period?: string;
}) {
  const response = await axios.get("/kepsek/helpdesk/analytics", { params });
  return response.data;
}

export async function getHelpDeskPerformance(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const response = await axios.get("/kepsek/helpdesk/performance", { params });
  return response.data;
}

export async function getHelpDeskSatisfaction(params?: {
  start_date?: string;
  end_date?: string;
}) {
  const response = await axios.get("/kepsek/helpdesk/satisfaction", { params });
  return response.data;
}

export async function getHelpDeskSummary() {
  const response = await axios.get("/kepsek/helpdesk/summary");
  return response.data;
}

export async function exportHelpDeskAnalytics(data: {
  start_date: string;
  end_date: string;
  format?: "json" | "csv";
}) {
  const response = await axios.get("/kepsek/helpdesk/export", {
    params: data,
  });
  return response.data;
}
