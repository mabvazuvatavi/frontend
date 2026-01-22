import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Tab as MuiTab,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Info,
  Image as ImageIcon,
  ArrowBack,
  Visibility,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminEventApprovalDashboard = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvals, setApprovals] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: 'pending',
    comments: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadApprovals();
    }
  }, [user]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/admin/event-approvals`, {
        method: 'GET',
      });
      const data = response.json ? await response.json() : response;
      if (response.ok) {
        setApprovals(data.data || data);
      }
    } catch (err) {
      console.error('Error loading approvals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setDetailsDialog(true);
  };

  const handleReviewClick = (approval) => {
    setSelectedApproval(approval);
    setReviewForm({ status: 'pending', comments: '' });
    setReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);

      const payload = {
        status: reviewForm.status,
        comments: reviewForm.comments,
      };

      const response = await apiRequest(
        `${API_BASE_URL}/admin/event-approvals/${selectedApproval.id}/review`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = response.json ? await response.json() : response;
      if (!response.ok) throw new Error(result.message || 'Failed to submit review');

      toast.success(`Event ${reviewForm.status}!`);
      setReviewDialog(false);
      await loadApprovals();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const filterApprovals = (status) => {
    if (status === 'pending') {
      return approvals.filter((a) => a.status === 'pending');
    }
    if (status === 'approved') {
      return approvals.filter((a) => a.status === 'approved');
    }
    if (status === 'rejected') {
      return approvals.filter((a) => a.status === 'rejected');
    }
    return approvals;
  };

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  };

  const statusIcons = {
    pending: <Info />,
    approved: <CheckCircle />,
    rejected: <Cancel />,
  };

  const currentApprovals = filterApprovals(
    tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected'
  );

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Only admins can access this page. Please log in as an admin.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin')}
          variant="text"
        >
          Back
        </Button>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Event Approvals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve events submitted by organizers
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: '#fff3cd',
                    borderRadius: 1,
                  }}
                >
                  <Info sx={{ color: '#856404' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {pendingCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: '#d4edda',
                    borderRadius: 1,
                  }}
                >
                  <CheckCircle sx={{ color: '#155724' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {approvedCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    backgroundColor: '#f8d7da',
                    borderRadius: 1,
                  }}
                >
                  <Cancel sx={{ color: '#721c24' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {rejectedCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab
              label={
                <Badge badgeContent={pendingCount} color="error">
                  Pending
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={approvedCount} color="success">
                  Approved
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={rejectedCount} color="error">
                  Rejected
                </Badge>
              }
            />
          </Tabs>
        </Box>

        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentApprovals.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No {tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected'} approvals
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Event</strong></TableCell>
                  <TableCell><strong>Organizer</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Pricing Tiers</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Submitted</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentApprovals.map((approval) => (
                  <TableRow key={approval.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {approval.event_snapshot?.title || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {approval.event_id?.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {approval.requested_by_name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={approval.event_snapshot?.event_mode || 'physical'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {approval.event_snapshot?.pricing_tiers?.length || 0} tiers
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={approval.status}
                        color={statusColors[approval.status]}
                        size="small"
                        icon={statusIcons[approval.status]}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(approval.requested_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(approval)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      {approval.status === 'pending' && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => handleReviewClick(approval)}
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedApproval && (
            <Grid container spacing={3}>
              {selectedApproval.event_snapshot?.event_image_url && (
                <Grid item xs={12}>
                  <Box
                    component="img"
                    src={selectedApproval.event_snapshot.event_image_url}
                    alt="Event"
                    sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 1 }}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Title
                </Typography>
                <Typography variant="body2">
                  {selectedApproval.event_snapshot?.title}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Mode
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {selectedApproval.event_snapshot?.event_mode}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Category
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {selectedApproval.event_snapshot?.category}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Organizer
                </Typography>
                <Typography variant="body2">
                  {selectedApproval.requested_by_name}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Description
                </Typography>
                <Typography variant="body2">
                  {selectedApproval.event_snapshot?.description}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Pricing Tiers
                </Typography>
                {selectedApproval.event_snapshot?.pricing_tiers?.map((tier, i) => (
                  <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
                    • {tier.tier_name}: KES {tier.base_price} × {tier.total_tickets}
                  </Typography>
                ))}
              </Grid>

              {selectedApproval.status !== 'pending' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Reviewer Comments
                    </Typography>
                    <Typography variant="body2">
                      {selectedApproval.reviewer_comments || 'No comments'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Reviewed At
                    </Typography>
                    <Typography variant="body2">
                      {selectedApproval.reviewed_at
                        ? new Date(selectedApproval.reviewed_at).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Review Event</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Decision"
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
              >
                <option value="approved">✓ Approve</option>
                <option value="rejected">✗ Reject</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                value={reviewForm.comments}
                onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                placeholder="Provide feedback for the organizer..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submitting}
            color={reviewForm.status === 'approved' ? 'success' : 'error'}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminEventApprovalDashboard;
