export type StatementStatus = 'MISSING' | 'UPLOADED' | 'OUTDATED';
export interface Provider { id: string; name: string }
export interface Statement { fileName: string; date: string }
export interface Account { id: string; provider: Provider; statement: Statement | null; status: StatementStatus }
export interface AccountsSnapshot { accounts: Account[]; readyCount: number; totalCount: number; canSubmit: boolean }
export interface ApiErrorBody { code: string; message: string; details: string[] }

