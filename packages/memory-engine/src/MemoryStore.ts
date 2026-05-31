import { SessionMemory } from "./type";

export class MemoryStore {
    private store = new Map<string, SessionMemory>();

    get(sessionId: string){
        return this.store.get(sessionId);
    }

    set(sessionId: string, history: string[]){
        this.store.set(sessionId, { sessionId, history });
    }

    clear(sessionId: string){
        this.store.delete(sessionId);
    }
}