export const TokenStorage = {
  save(token: string): void {
    localStorage.setItem('admin_token', token)
  },

  get(): string | null {
    return localStorage.getItem('admin_token')
  },

  remove(): void {
    localStorage.removeItem('admin_token')
  },
}
