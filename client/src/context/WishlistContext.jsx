import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setSavedIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        const items = res.data.wishlist || [];
        setWishlist(items);
        const ids = new Set(items.map(item => item._id || item));
        setSavedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (donationId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist');
      return false;
    }

    try {
      const res = await api.post('/wishlist/toggle', { donationId });
      if (res.data.success) {
        toast.success(res.data.message);
        const newSet = new Set(savedIds);
        if (res.data.isSaved) {
          newSet.add(donationId);
        } else {
          newSet.delete(donationId);
        }
        setSavedIds(newSet);
        fetchWishlist();
        return res.data.isSaved;
      }
    } catch (err) {
      toast.error('Could not update saved items.');
      return false;
    }
  };

  const isSaved = (donationId) => {
    return savedIds.has(donationId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        savedIds,
        loading,
        toggleWishlist,
        isSaved,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
