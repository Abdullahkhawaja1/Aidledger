// Grid API Integration for Payment Processing
// https://www.grid.so/

// Use Vite env var; ensure key is provided at build/runtime as VITE_GRID_API_KEY
const GRID_API_KEY = (import.meta && import.meta.env && import.meta.env.VITE_GRID_API_KEY) || 'YOUR_GRID_API_KEY_HERE';
const GRID_API_URL = 'https://api.grid.so/v1';

/**
 * Initialize Grid payment for a donor
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Payment session
 */
export const createPaymentSession = async (paymentData) => {
  try {
    const response = await fetch(`${GRID_API_URL}/payment-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        description: `Aid donation - ${paymentData.aidType}`,
        metadata: {
          refugeeId: paymentData.refugeeId,
          ngoId: paymentData.ngoId,
          aidType: paymentData.aidType,
          donorBillNumber: paymentData.donorBillNumber,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Grid API error: ${response.statusText}`);
    }

    const session = await response.json();
    return {
      success: true,
      sessionId: session.id,
      paymentUrl: session.payment_url,
      status: session.status,
    };
  } catch (error) {
    console.error('Grid payment session creation failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify payment status
 * @param {string} sessionId - Payment session ID
 * @returns {Promise<Object>} Payment status
 */
export const verifyPayment = async (sessionId) => {
  try {
    const response = await fetch(`${GRID_API_URL}/payment-sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${GRID_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Grid API error: ${response.statusText}`);
    }

    const session = await response.json();
    return {
      success: true,
      status: session.status,
      paid: session.status === 'paid',
      amount: session.amount,
      metadata: session.metadata,
    };
  } catch (error) {
    console.error('Grid payment verification failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Process payout to NGO
 * @param {Object} payoutData - Payout information
 * @returns {Promise<Object>} Payout result
 */
export const processNGOPayout = async (payoutData) => {
  try {
    const response = await fetch(`${GRID_API_URL}/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: payoutData.amount,
        currency: payoutData.currency || 'USD',
        destination: payoutData.ngoAccountId,
        description: `Aid distribution payout - ${payoutData.ngoName}`,
        metadata: {
          ngoId: payoutData.ngoId,
          transactionIds: payoutData.transactionIds,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Grid API error: ${response.statusText}`);
    }

    const payout = await response.json();
    return {
      success: true,
      payoutId: payout.id,
      status: payout.status,
    };
  } catch (error) {
    console.error('Grid payout failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get Grid account balance
 * @returns {Promise<Object>} Account balance
 */
export const getAccountBalance = async () => {
  try {
    const response = await fetch(`${GRID_API_URL}/balance`, {
      headers: {
        'Authorization': `Bearer ${GRID_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Grid API error: ${response.statusText}`);
    }

    const balance = await response.json();
    return {
      success: true,
      available: balance.available,
      pending: balance.pending,
      currency: balance.currency,
    };
  } catch (error) {
    console.error('Grid balance check failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  createPaymentSession,
  verifyPayment,
  processNGOPayout,
  getAccountBalance,
};

