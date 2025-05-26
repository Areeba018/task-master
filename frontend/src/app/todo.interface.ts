export interface Todo {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
}

export interface TodoCreate {
    title: string;
    description?: string;
} 