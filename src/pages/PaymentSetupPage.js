import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PaymentSetupPage = () => {
  const { user, apiRequest, API_BASE_URL, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentInfo, setPaymentInfo] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountHolderName: '',
    mpesaNumber: '',
    pesepalEmail: '',
    equitelNumber: '',
    airtelMoneyNumber: '',
    tkashNumber: '',
  });
  const [fetchedInfo, setFetchedInfo] = useState(null);
  const [errors, setErrors] = useState({});

  // Helper function to ensure numeric values
  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to format currency safely
  const formatCurrency = (value) => {
    const num = toNumber(value);
    return num.toFixed(2);
  };

  // Fetch existing payment info on load
  useEffect(() => {
    // Refresh user data to check if approval status has changed
    refreshUser();
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/payouts/info`);

      if (!response.ok) throw new Error('Failed to fetch payment info');

      const { data } = await response.json();
      // Ensure all numeric fields are actually numbers
      const paymentData = {
        ...data,
        total_earnings: toNumber(data?.total_earnings),
        pending_balance: toNumber(data?.pending_balance),
        commission_percentage: toNumber(data?.commission_percentage),
      };
      setFetchedInfo(paymentData);
      
      // Pre-fill form if info exists
      if (data.bank_account_number) {
        setPaymentMethod('bank');
        setPaymentInfo({
          accountNumber: data.bank_account_number || '',
          bankCode: data.bank_code || '',
          bankName: data.bank_name || '',
          accountHolderName: data.account_holder_name || '',
          mpesaNumber: data.mpesa_number || '',
          pesepalEmail: data.pesepal_email || '',
          equitelNumber: data.equitel_number || '',
          airtelMoneyNumber: data.airtel_money_number || '',
          tkashNumber: data.tkash_number || ''
        });
      } else if (data.mpesa_number) {
        setPaymentMethod('mpesa');
        setPaymentInfo(prev => ({
          ...prev,
          mpesaNumber: data.mpesa_number || ''
        }));
      } else if (data.pesepal_email) {
        setPaymentMethod('pesepal');
        setPaymentInfo(prev => ({
          ...prev,
          pesepalEmail: data.pesepal_email || ''
        }));
      } else if (data.equitel_number) {
        setPaymentMethod('equitel');
        setPaymentInfo(prev => ({
          ...prev,
          equitelNumber: data.equitel_number || ''
        }));
      } else if (data.airtel_money_number) {
        setPaymentMethod('airtel_money');
        setPaymentInfo(prev => ({
          ...prev,
          airtelMoneyNumber: data.airtel_money_number || ''
        }));
      } else if (data.tkash_number) {
        setPaymentMethod('tkash');
        setPaymentInfo(prev => ({
          ...prev,
          tkashNumber: data.tkash_number || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'bank') {
      if (!paymentInfo.accountNumber?.trim() || paymentInfo.accountNumber.length < 8) {
        newErrors.accountNumber = 'Account number must be at least 8 characters';
      }
      if (!paymentInfo.bankCode?.trim() || paymentInfo.bankCode.length < 2) {
        newErrors.bankCode = 'Bank code is required';
      }
      if (!paymentInfo.bankName?.trim() || paymentInfo.bankName.length < 3) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!paymentInfo.accountHolderName?.trim() || paymentInfo.accountHolderName.length < 3) {
        newErrors.accountHolderName = 'Account holder name is required';
      }
    } else if (paymentMethod === 'mpesa') {
      if (!paymentInfo.mpesaNumber?.trim() || paymentInfo.mpesaNumber.length < 10) {
        newErrors.mpesaNumber = 'Valid M-Pesa phone number is required (10+ digits)';
      }
    } else if (paymentMethod === 'pesepal') {
      if (!paymentInfo.pesepalEmail?.trim() || !paymentInfo.pesepalEmail.includes('@')) {
        newErrors.pesepalEmail = 'Valid Pesepal email is required';
      }
    } else if (paymentMethod === 'equitel') {
      if (!paymentInfo.equitelNumber?.trim() || paymentInfo.equitelNumber.length < 10) {
        newErrors.equitelNumber = 'Valid Equitel phone number is required (10+ digits)';
      }
    } else if (paymentMethod === 'airtel_money') {
      if (!paymentInfo.airtelMoneyNumber?.trim() || paymentInfo.airtelMoneyNumber.length < 10) {
        newErrors.airtelMoneyNumber = 'Valid Airtel Money phone number is required (10+ digits)';
      }
    } else if (paymentMethod === 'tkash') {
      if (!paymentInfo.tkashNumber?.trim() || paymentInfo.tkashNumber.length < 10) {
        newErrors.tkashNumber = 'Valid T-Kash phone number is required (10+ digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare payload based on payment method
      let payload = { payment_method: paymentMethod };
      
      if (paymentMethod === 'bank') {
        payload = {
          ...payload,
          accountNumber: paymentInfo.accountNumber,
          bankCode: paymentInfo.bankCode,
          bankName: paymentInfo.bankName,
          accountHolderName: paymentInfo.accountHolderName
        };
      } else if (paymentMethod === 'mpesa') {
        payload = {
          ...payload,
          mpesaNumber: paymentInfo.mpesaNumber
        };
      } else if (paymentMethod === 'pesepal') {
        payload = {
          ...payload,
          pesepalEmail: paymentInfo.pesepalEmail
        };
      } else if (paymentMethod === 'equitel') {
        payload = {
          ...payload,
          equitelNumber: paymentInfo.equitelNumber
        };
      } else if (paymentMethod === 'airtel_money') {
        payload = {
          ...payload,
          airtelMoneyNumber: paymentInfo.airtelMoneyNumber
        };
      } else if (paymentMethod === 'tkash') {
        payload = {
          ...payload,
          tkashNumber: paymentInfo.tkashNumber
        };
      }
      
      const response = await apiRequest(`${API_BASE_URL}/payouts/info`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment info');
      }

      const { data } = await response.json();
      setFetchedInfo(data);
      toast.success('Payment information updated successfully. Awaiting admin verification.');
    } catch (error) {
      console.error('Error updating payment info:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getVerificationStatus = (status) => {
    const statusConfig = {
      'unverified': { color: 'default', label: 'Not Started' },
      'pending': { color: 'warning', label: 'Pending Verification' },
      'verified': { color: 'success', label: 'Verified' },
      'failed': { color: 'error', label: 'Verification Failed' }
    };

    const config = statusConfig[status] || statusConfig['unverified'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (!['organizer', 'venue_manager'].includes(user?.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">
          Payment setup is only available for organizers and venue managers.
        </Alert>
      </Container>
    );
  }

  // Check if user has been approved
  if (user?.approval_status !== 'approved') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Approval Pending
          </Typography>
          <Typography variant="body2">
            Your account is still pending admin approval. You'll be able to set up payment information once approved.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
            Current Status: <strong>{user?.approval_status || 'pending'}</strong>
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Payment Information
      </Typography>

      {/* Verification Status Card */}
      {fetchedInfo && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Verification Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Payment Verification
                  </Typography>
                </Box>
                {getVerificationStatus(fetchedInfo.payment_verification_status)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Commission Rate
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {fetchedInfo.commission_percentage}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Earnings
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ${formatCurrency(fetchedInfo?.total_earnings)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Pending Balance
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ${formatCurrency(fetchedInfo?.pending_balance)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Payment Information Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Select Payment Method
          </Typography>
          
          <RadioGroup
            row
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mb: 4 }}
          >
            <FormControlLabel
              value="bank"
              control={<Radio />}
              label="Bank Transfer"
              disabled={loading}
            />
            <FormControlLabel
              value="mpesa"
              control={<Radio />}
              label="M-Pesa"
              disabled={loading}
            />
            <FormControlLabel
              value="pesepal"
              control={<Radio />}
              label="Pesepal"
              disabled={loading}
            />
            <FormControlLabel
              value="equitel"
              control={<Radio />}
              label="Equitel Money"
              disabled={loading}
            />
            <FormControlLabel
              value="airtel_money"
              control={<Radio />}
              label="Airtel Money"
              disabled={loading}
            />
            <FormControlLabel
              value="tkash"
              control={<Radio />}
              label="T-Kash"
              disabled={loading}
            />
          </RadioGroup>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* Bank Transfer Fields */}
            {paymentMethod === 'bank' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your bank account details for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Account Number"
                    name="accountNumber"
                    value={paymentInfo.accountNumber}
                    onChange={handleChange}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Code"
                    name="bankCode"
                    value={paymentInfo.bankCode}
                    onChange={handleChange}
                    error={!!errors.bankCode}
                    helperText={errors.bankCode}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    name="bankName"
                    value={paymentInfo.bankName}
                    onChange={handleChange}
                    error={!!errors.bankName}
                    helperText={errors.bankName}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={paymentInfo.accountHolderName}
                    onChange={handleChange}
                    error={!!errors.accountHolderName}
                    helperText={errors.accountHolderName}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* M-Pesa Fields */}
            {paymentMethod === 'mpesa' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your M-Pesa phone number for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="M-Pesa Phone Number"
                    name="mpesaNumber"
                    placeholder="+254..."
                    value={paymentInfo.mpesaNumber}
                    onChange={handleChange}
                    error={!!errors.mpesaNumber}
                    helperText={errors.mpesaNumber || 'Your registered M-Pesa phone number'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* Pesepal Fields */}
            {paymentMethod === 'pesepal' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your Pesepal email for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pesepal Email"
                    name="pesepalEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={paymentInfo.pesepalEmail}
                    onChange={handleChange}
                    error={!!errors.pesepalEmail}
                    helperText={errors.pesepalEmail || 'Your Pesepal registered email'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* Equitel Fields */}
            {paymentMethod === 'equitel' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your Equitel phone number for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Equitel Phone Number"
                    name="equitelNumber"
                    placeholder="+254..."
                    value={paymentInfo.equitelNumber}
                    onChange={handleChange}
                    error={!!errors.equitelNumber}
                    helperText={errors.equitelNumber || 'Your registered Equitel phone number'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* Airtel Money Fields */}
            {paymentMethod === 'airtel_money' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your Airtel Money phone number for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Airtel Money Phone Number"
                    name="airtelMoneyNumber"
                    placeholder="+254..."
                    value={paymentInfo.airtelMoneyNumber}
                    onChange={handleChange}
                    error={!!errors.airtelMoneyNumber}
                    helperText={errors.airtelMoneyNumber || 'Your registered Airtel Money phone number'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* T-Kash Fields */}
            {paymentMethod === 'tkash' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your T-Kash phone number for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="T-Kash Phone Number"
                    name="tkashNumber"
                    placeholder="+254..."
                    value={paymentInfo.tkashNumber}
                    onChange={handleChange}
                    error={!!errors.tkashNumber}
                    helperText={errors.tkashNumber || 'Your registered T-Kash phone number'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Saving...' : 'Save Payment Method'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info">
        Your payment information will be verified by an administrator before you can request payouts.
        Ensure all details are accurate.
      </Alert>
    </Container>
  );
};

export default PaymentSetupPage;
