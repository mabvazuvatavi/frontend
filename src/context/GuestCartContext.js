import React, { createContext, useContext, useState, useEffect } from 'react';

const GuestCartContext = createContext();

export const GuestCartProvider = ({ children }) => {
  // Initialize from localStorage immediately if available
  const getStoredCartId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('guestCartId');
    }
    return null;
  };

  const [guestCart, setGuestCart] = useState(null);
  const [guestCartId, setGuestCartId] = useState(getStoredCartId());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for storage changes (from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'guestCartId') {
        console.log('Storage changed - guestCartId:', e.newValue);
        setGuestCartId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const createGuestCart = async (apiRequest, API_BASE_URL) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiRequest(`${API_BASE_URL}/guest/cart/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (result?.success && result.data) {
        const newCartId = result.data.cartId;
        setGuestCartId(newCartId);
        localStorage.setItem('guestCartId', newCartId);
        return newCartId;
      } else {
        throw new Error(result.message || 'Failed to create guest cart');
      }
    } catch (err) {
      console.error('Create guest cart error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGuestCart = async (cartId, apiRequest, API_BASE_URL) => {
    try {
      setLoading(true);

      const result = await apiRequest(`${API_BASE_URL}/guest/cart/${cartId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (result?.success && result.data) {
        setGuestCart(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to get guest cart');
      }
    } catch (err) {
      console.error('Get guest cart error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addToGuestCart = async (cartId, itemDataOrEventId, quantity, ticketType, price, apiRequest, API_BASE_URL) => {
    try {
      setLoading(true);
      setError(null);

      let bodyData;
      
      // Support both old signature (eventId, quantity, ...) and new unified format (itemData object)
      if (typeof itemDataOrEventId === 'object' && itemDataOrEventId !== null) {
        // New unified format: { item_type, item_ref_id, item_title, quantity, price, metadata }
        bodyData = itemDataOrEventId;
      } else {
        // Legacy format: eventId, quantity, ticketType, price
        bodyData = {
          event_id: itemDataOrEventId,
          quantity,
          ticket_type: ticketType,
          price,
        };
      }

      const result = await apiRequest(`${API_BASE_URL}/guest/cart/${cartId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!result?.success) {
        const errorMessage = result.message || 'Failed to add item to cart';
        throw new Error(errorMessage);
      }

      // Item was added successfully - return success
      return { success: true };
    } catch (err) {
      console.error('Add to guest cart error:', err);
      const errorMsg = err.message || 'Failed to add item to cart';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromGuestCart = async (cartId, itemId, apiRequest, API_BASE_URL) => {
    try {
      setLoading(true);

      const result = await apiRequest(`${API_BASE_URL}/guest/cart/${cartId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (result?.success) {
        // Refresh cart
        return await getGuestCart(cartId, apiRequest, API_BASE_URL);
      } else {
        throw new Error(result?.message || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Remove from guest cart error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearGuestCart = async (cartId, apiRequest, API_BASE_URL) => {
    try {
      setLoading(true);

      const result = await apiRequest(`${API_BASE_URL}/guest/cart/${cartId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (result?.success) {
        setGuestCart(null);
        setGuestCartId(null);
        localStorage.removeItem('guestCartId');
        return true;
      } else {
        throw new Error(result?.message || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Clear guest cart error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeGuestCheckout = async (cartId, billingData, apiRequest, API_BASE_URL) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiRequest(`${API_BASE_URL}/guest/checkout/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_id: cartId,
          billing_address: billingData,
        }),
      });

      if (result?.success && result.data) {
        setGuestCart(null);
        setGuestCartId(null);
        localStorage.removeItem('guestCartId');
        return result.data;
      } else {
        throw new Error(result.message || 'Checkout failed');
      }
    } catch (err) {
      console.error('Guest checkout error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestCartContext.Provider
      value={{
        guestCart,
        guestCartId,
        loading,
        error,
        createGuestCart,
        getGuestCart,
        addToGuestCart,
        removeFromGuestCart,
        clearGuestCart,
        completeGuestCheckout,
      }}
    >
      {children}
    </GuestCartContext.Provider>
  );
};

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (!context) {
    throw new Error('useGuestCart must be used within GuestCartProvider');
  }
  return context;
};
