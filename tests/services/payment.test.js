const PaymentService = require('../../src/services/payment');
const axios = require('axios');

// Mock axios for HTTP requests
jest.mock('axios');
const mockedAxios = axios;

describe('PaymentService', () => {
  let paymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    const validPaymentData = {
      amount: 100.50,
      currency: 'USD',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      customerEmail: 'test@example.com'
    };

    describe('Success cases', () => {
      it('should process payment successfully with valid data', async () => {
        const mockResponse = {
          data: {
            transactionId: 'txn_123456',
            status: 'success',
            amount: 100.50,
            currency: 'USD'
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: true,
          transactionId: 'txn_123456',
          amount: 100.50,
          currency: 'USD'
        });
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/payments'),
          expect.objectContaining({
            amount: 100.50,
            currency: 'USD'
          }),
          expect.any(Object)
        );
      });

      it('should handle different currencies', async () => {
        const eurPayment = { ...validPaymentData, currency: 'EUR', amount: 85.25 };
        const mockResponse = {
          data: {
            transactionId: 'txn_789',
            status: 'success',
            amount: 85.25,
            currency: 'EUR'
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await paymentService.processPayment(eurPayment);

        expect(result.success).toBe(true);
        expect(result.currency).toBe('EUR');
        expect(result.amount).toBe(85.25);
      });
    });

    describe('Failure cases', () => {
      it('should handle invalid card number', async () => {
        const invalidPayment = { ...validPaymentData, cardNumber: '1234' };

        const result = await paymentService.processPayment(invalidPayment);

        expect(result).toEqual({
          success: false,
          error: 'Invalid card number',
          code: 'INVALID_CARD'
        });
      });

      it('should handle expired card', async () => {
        const expiredCardPayment = {
          ...validPaymentData,
          expiryMonth: '01',
          expiryYear: '2020'
        };

        const result = await paymentService.processPayment(expiredCardPayment);

        expect(result).toEqual({
          success: false,
          error: 'Card has expired',
          code: 'EXPIRED_CARD'
        });
      });

      it('should handle insufficient funds', async () => {
        const mockError = {
          response: {
            status: 402,
            data: {
              error: 'Insufficient funds',
              code: 'INSUFFICIENT_FUNDS'
            }
          }
        };

        mockedAxios.post.mockRejectedValueOnce(mockError);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: false,
          error: 'Insufficient funds',
          code: 'INSUFFICIENT_FUNDS'
        });
      });

      it('should handle invalid amount (negative)', async () => {
        const negativeAmountPayment = { ...validPaymentData, amount: -50 };

        const result = await paymentService.processPayment(negativeAmountPayment);

        expect(result).toEqual({
          success: false,
          error: 'Amount must be greater than 0',
          code: 'INVALID_AMOUNT'
        });
      });

      it('should handle invalid amount (zero)', async () => {
        const zeroAmountPayment = { ...validPaymentData, amount: 0 };

        const result = await paymentService.processPayment(zeroAmountPayment);

        expect(result).toEqual({
          success: false,
          error: 'Amount must be greater than 0',
          code: 'INVALID_AMOUNT'
        });
      });

      it('should handle missing required fields', async () => {
        const incompletePayment = {
          amount: 100,
          currency: 'USD'
          // missing card details
        };

        const result = await paymentService.processPayment(incompletePayment);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Missing required field');
        expect(result.code).toBe('MISSING_REQUIRED_FIELD');
      });

      it('should handle payment gateway rejection', async () => {
        const mockError = {
          response: {
            status: 400,
            data: {
              error: 'Payment declined by issuer',
              code: 'PAYMENT_DECLINED'
            }
          }
        };

        mockedAxios.post.mockRejectedValueOnce(mockError);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: false,
          error: 'Payment declined by issuer',
          code: 'PAYMENT_DECLINED'
        });
      });
    });

    describe('Edge cases and network issues', () => {
      it('should handle network timeout', async () => {
        const timeoutError = {
          code: 'ECONNABORTED',
          message: 'timeout of 5000ms exceeded'
        };

        mockedAxios.post.mockRejectedValueOnce(timeoutError);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: false,
          error: 'Request timeout - please try again',
          code: 'TIMEOUT'
        });
      });

      it('should handle network connection error', async () => {
        const networkError = {
          code: 'ENOTFOUND',
          message: 'getaddrinfo ENOTFOUND payment-gateway.com'
        };

        mockedAxios.post.mockRejectedValueOnce(networkError);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: false,
          error: 'Network error - please check your connection',
          code: 'NETWORK_ERROR'
        });
      });

      it('should handle server error (5xx)', async () => {
        const serverError = {
          response: {
            status: 500,
            data: {
              error: 'Internal server error'
            }
          }
        };

        mockedAxios.post.mockRejectedValueOnce(serverError);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: false,
          error: 'Payment service temporarily unavailable',
          code: 'SERVER_ERROR'
        });
      });

      it('should handle very large amounts', async () => {
        const largeAmountPayment = { ...validPaymentData, amount: 999999999.99 };
        
        const mockResponse = {
          data: {
            transactionId: 'txn_large',
            status: 'success',
            amount: 999999999.99,
            currency: 'USD'
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await paymentService.processPayment(largeAmountPayment);

        expect(result.success).toBe(true);
        expect(result.amount).toBe(999999999.99);
      });

      it('should handle decimal precision correctly', async () => {
        const preciseAmountPayment = { ...validPaymentData, amount: 12.345 };
        
        // Should round to 2 decimal places
        const result = await paymentService.processPayment(preciseAmountPayment);
        
        if (mockedAxios.post.mock.calls.length > 0) {
          const callArgs = mockedAxios.post.mock.calls[0][1];
          expect(callArgs.amount).toBe(12.35); // Rounded to 2 decimal places
        }
      });

      it('should handle malformed response from payment gateway', async () => {
        const malformedResponse = {
          data: {
            // Missing required fields
            status: 'unknown'
          }
        };

        mockedAxios.post.mockResolvedValueOnce(malformedResponse);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual({
          success: false,
          error: 'Invalid response from payment gateway',
          code: 'INVALID_RESPONSE'
        });
      });
    });
  });

  describe('refundPayment', () => {
    it('should process refund successfully', async () => {
      const mockResponse = {
        data: {
          refundId: 'ref_123456',
          status: 'success',
          amount: 50.25,
          originalTransactionId: 'txn_789'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await paymentService.refundPayment('txn_789', 50.25);

      expect(result).toEqual({
        success: true,
        refundId: 'ref_123456',
        amount: 50.25,
        originalTransactionId: 'txn_789'
      });
    });

    it('should handle refund failure', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: 'Transaction not found',
            code: 'TRANSACTION_NOT_FOUND'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const result = await paymentService.refundPayment('invalid_txn', 50);

      expect(result).toEqual({
        success: false,
        error: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND'
      });
    });
  });

  describe('validatePaymentData', () => {
    it('should return true for valid payment data', () => {
      const validData = {
        amount: 100,
        currency: 'USD',
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        customerEmail: 'test@example.com'
      };

      const result = paymentService.validatePaymentData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return false for invalid email', () => {
      const invalidData = {
        amount: 100,
        currency: 'USD',
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        customerEmail: 'invalid-email'
      };

      const result = paymentService.validatePaymentData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });
});