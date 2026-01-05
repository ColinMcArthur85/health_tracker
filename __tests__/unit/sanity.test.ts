/**
 * @file sanity.test.ts
 * @description Sanity test to verify Jest setup is working correctly
 */

describe('Jest Setup Verification', () => {
  describe('Basic functionality', () => {
    it('should pass a simple assertion', () => {
      expect(2 + 2).toBe(4);
    });

    it('should have access to jest-dom matchers', () => {
      const element = document.createElement('div');
      element.textContent = 'Hello World';
      document.body.appendChild(element);
      
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Hello World');
      
      document.body.removeChild(element);
    });

    it('should have mocked fetch available', () => {
      expect(global.fetch).toBeDefined();
      expect(jest.isMockFunction(global.fetch)).toBe(true);
    });

    it('should have test environment variables', () => {
      expect(process.env.OPENAI_API_KEY).toBe('test-openai-key-not-real');
      expect(process.env.DATABASE_URL).toBeDefined();
    });
  });

  describe('Async functionality', () => {
    it('should handle async/await', async () => {
      const asyncFn = async () => 'resolved';
      const result = await asyncFn();
      expect(result).toBe('resolved');
    });

    it('should handle promises', () => {
      return Promise.resolve('success').then((value) => {
        expect(value).toBe('success');
      });
    });
  });

  describe('Mock functionality', () => {
    it('should be able to create and use mocks', () => {
      const mockFn = jest.fn().mockReturnValue('mocked');
      expect(mockFn()).toBe('mocked');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should be able to mock fetch responses', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/test');
    });
  });
});
