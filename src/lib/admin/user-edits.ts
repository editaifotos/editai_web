export const USER_EDITS_PAGE_SIZE = 20;

export const USER_EDITS_SELECT =
  "id, operation_type, status, created_at, prompt_text_original, prompt_text, image_url, original_image_url, edit_category, edit_goal, credits_used, width, height, ai_processing_time_ms, task_id";

export type UserEditRow = {
  id: string;
  operation_type: string | null;
  status: string | null;
  created_at: string;
  prompt_text_original: string | null;
  prompt_text: string | null;
  image_url: string | null;
  original_image_url: string | null;
  edit_category: string | null;
  edit_goal: string | null;
  credits_used: number | null;
  width: number | null;
  height: number | null;
  ai_processing_time_ms: number | null;
  task_id: string | null;
  error_message: string | null;
  provider_status: string | null;
};

export type UserEditsPage = {
  edits: UserEditRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
