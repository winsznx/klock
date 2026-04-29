export class TrieNode { children = new Map<string, TrieNode>(); isEndOfWord = false; }
export class Trie {
  root = new TrieNode();
  insert(word: string) { let curr = this.root; for (const char of word) { if (!curr.children.has(char)) curr.children.set(char, new TrieNode()); curr = curr.children.get(char)!; } curr.isEndOfWord = true; }
}
