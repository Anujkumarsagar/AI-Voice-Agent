export class ConversationManager {
  private history: string[] = [];

  addMessage(message: string) {
    this.history.push(message);
  }

  getHistory() {
    return this.history;
  }

  clear() {
    this.history = [];
  }
}