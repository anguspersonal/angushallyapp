const { PaymentService } = require('../../src/services/payment');
const { PaymentGateway } = require('../../src/gateways/paymentGateway');

// Mock the payment gateway
jest.mock('../../src/gateways/paymentGateway');

describe('PaymentService', () => {
  let paymentService;
  let mockPaymentGateway;

  beforeEach(() => {
    mockPaymentGateway = new PaymentGateway();
    paymentService = new PaymentService(mockPaymentGateway);
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    const validPaymentData = {
      amount: 100.00,
      currency: 'USD',
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
      customerEmail: 'test@example.com'
    };

    describe('Success cases', () => {
      test('should process payment successfully with valid data', async () => {
        const expectedResponse = {
          success: true,
          transactionId: 'txn_123456',
          status: 'completed'
        };

        mockPaymentGateway.charge.mockResolvedValue(expectedResponse);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result).toEqual(expectedResponse);
        expect(mockPaymentGateway.charge).toHaveBeenCalledWith(validPaymentData);
        expect(mockPaymentGateway.charge).toHaveBeenCalledTimes(1);
      });

      test('should handle different currencies', async () => {
        const euroPayment = { ...validPaymentData, currency: 'EUR' };
        const expectedResponse = {
          success: true,
          transactionId: 'txn_789',
          status: 'completed'
        };

        mockPaymentGateway.charge.mockResolvedValue(expectedResponse);

        const result = await paymentService.processPayment(euroPayment);

        expect(result.success).toBe(true);
        expect(mockPaymentGateway.charge).toHaveBeenCalledWith(euroPayment);
      });

      test('should handle large payment amounts', async () => {
        const largePayment = { ...validPaymentData, amount: 10000.99 };
        const expectedResponse = {
          success: true,
          transactionId: 'txn_large',
          status: 'completed'
        };

        mockPaymentGateway.charge.mockResolvedValue(expectedResponse);

        const result = await paymentService.processPayment(largePayment);

        expect(result.success).toBe(true);
        expect(result.transactionId).toBe('txn_large');
      });
    });

    describe('Failure cases', () => {
      test('should handle insufficient funds error', async () => {
        const errorResponse = {
          success: false,
          error: 'INSUFFICIENT_FUNDS',
          message: 'Card has insufficient funds'
        };

        mockPaymentGateway.charge.mockResolvedValue(errorResponse);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('INSUFFICIENT_FUNDS');
        expect(result.message).toBe('Card has insufficient funds');
      });

      test('should handle invalid card error', async () => {
        const invalidCardData = { ...validPaymentData, cardNumber: '1234567890123456' };
        const errorResponse = {
          success: false,
          error: 'INVALID_CARD',
          message: 'Card number is invalid'
        };

        mockPaymentGateway.charge.mockResolvedValue(errorResponse);

        const result = await paymentService.processPayment(invalidCardData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('INVALID_CARD');
      });

      test('should handle expired card error', async () => {
        const expiredCardData = { ...validPaymentData, expiryDate: '12/20' };
        const errorResponse = {
          success: false,
          error: 'CARD_EXPIRED',
          message: 'Card has expired'
        };

        mockPaymentGateway.charge.mockResolvedValue(errorResponse);

        const result = await paymentService.processPayment(expiredCardData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('CARD_EXPIRED');
      });

      test('should handle payment gateway rejection', async () => {
        const errorResponse = {
          success: false,
          error: 'PAYMENT_DECLINED',
          message: 'Payment was declined by the issuer'
        };

        mockPaymentGateway.charge.mockResolvedValue(errorResponse);

        const result = await paymentService.processPayment(validPaymentData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('PAYMENT_DECLINED');
      });
    });

    describe('Edge cases and error handling', () => {
      test('should handle network timeout', async () => {
        const timeoutError = new Error('Network timeout');
        timeoutError.code = 'TIMEOUT';
        
        mockPaymentGateway.charge.mockRejectedValue(timeoutError);

        await expect(paymentService.processPayment(validPaymentData))
          .rejects.toThrow('Network timeout');
      });

      test('should handle gateway service unavailable', async () => {
        const serviceError = new Error('Service temporarily unavailable');
        serviceError.code = 'SERVICE_UNAVAILABLE';
        
        mockPaymentGateway.charge.mockRejectedValue(serviceError);

        await expect(paymentService.processPayment(validPaymentData))
          .rejects.toThrow('Service temporarily unavailable');
      });

      test('should handle missing required fields', async () => {
        const incompleteData = { amount: 100.00, currency: 'USD' };
        
        await expect(paymentService.processPayment(incompleteData))
          .rejects.toThrow('Missing required payment information');
        
        expect(mockPaymentGateway.charge).not.toHaveBeenCalled();
      });

      test('should handle invalid amount (zero)', async () => {
        const invalidAmount = { ...validPaymentData, amount: 0 };
        
        await expect(paymentService.processPayment(invalidAmount))
          .rejects.toThrow('Amount must be greater than zero');
      });

      test('should handle invalid amount (negative)', async () => {
        const negativeAmount = { ...validPaymentData, amount: -50 };
        
        await expect(paymentService.processPayment(negativeAmount))
          .rejects.toThrow('Amount must be greater than zero');
      });

      test('should handle very small amounts', async () => {
        const smallAmount = { ...validPaymentData, amount: 0.01 };
        const expectedResponse = {
          success: true,
          transactionId: 'txn_small',
          status: 'completed'
        };

        mockPaymentGateway.charge.mockResolvedValue(expectedResponse);

        const result = await paymentService.processPayment(smallAmount);

        expect(result.success).toBe(true);
      });

      test('should handle malformed card number', async () => {
        const malformedCard = { ...validPaymentData, cardNumber: 'abcd1234' };
        
        await expect(paymentService.processPayment(malformedCard))
          .rejects.toThrow('Invalid card number format');
      });

      test('should handle invalid CVV', async () => {
        const invalidCvv = { ...validPaymentData, cvv: '12' };
        
        await expect(paymentService.processPayment(invalidCvv))
          .rejects.toThrow('Invalid CVV format');
      });

      test('should handle network connection error', async () => {
        const connectionError = new Error('ECONNREFUSED');
        connectionError.code = 'ECONNREFUSED';
        
        mockPaymentGateway.charge.mockRejectedValue(connectionError);

        await expect(paymentService.processPayment(validPaymentData))
          .rejects.toThrow('ECONNREFUSED');
      });
    });

    describe('Retry logic', () => {
      test('should retry on transient failures', async () => {
        const transientError = new Error('Temporary failure');
        transientError.code = 'TRANSIENT_ERROR';
        
        mockPaymentGateway.charge
          .mockRejectedValueOnce(transientError)
          .mockRejectedValueOnce(transientError)
          .mockResolvedValue({
            success: true,
            transactionId: 'txn_retry_success',
            status: 'completed'
          });

        const result = await paymentService.processPaymentWithRetry(validPaymentData);

        expect(result.success).toBe(true);
        expect(mockPaymentGateway.charge).toHaveBeenCalledTimes(3);
      });

      test('should fail after maximum retries', async () => {
        const persistentError = new Error('Persistent failure');
        persistentError.code = 'PERSISTENT_ERROR';
        
        mockPaymentGateway.charge.mockRejectedValue(persistentError);

        await expect(paymentService.processPaymentWithRetry(validPaymentData))
          .rejects.toThrow('Persistent failure');
        
        expect(mockPaymentGateway.charge).toHaveBeenCalledTimes(3); // Default max retries
      });
    });
  });

  describe('refundPayment', () => {
    const refundData = {
      transactionId: 'txn_123456',
      amount: 50.00,
      reason: 'Customer request'
    };

    test('should process refund successfully', async () => {
      const expectedResponse = {
        success: true,
        refundId: 'refund_789',
        status: 'completed'
      };

      mockPaymentGateway.refund.mockResolvedValue(expectedResponse);

      const result = await paymentService.refundPayment(refundData);

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentGateway.refund).toHaveBeenCalledWith(refundData);
    });

    test('should handle refund failure', async () => {
      const errorResponse = {
        success: false,
        error: 'REFUND_FAILED',
        message: 'Original transaction not found'
      };

      mockPaymentGateway.refund.mockResolvedValue(errorResponse);

      const result = await paymentService.refundPayment(refundData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('REFUND_FAILED');
    });
  });
});