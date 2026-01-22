import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
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
  Alert,
  Skeleton,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ConfirmationNumber,
  Event,
  LocationOn,
  AccessTime,
  Cancel,
  QrCode,
  Download,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import shashaPassLogo from '../../assets/shashapass.png';
import QRCodeDisplay from '../../components/Tickets/QRCodeDisplay';
import NFCDisplay from '../../components/Tickets/NFCDisplay';
import RFIDDisplay from '../../components/Tickets/RFIDDisplay';

const TicketsPage = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [seasonalPasses, setSeasonalPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState('regular');
  const [cancelDialog, setCancelDialog] = useState({ open: false, ticket: null });
  const [refundDialog, setRefundDialog] = useState({ open: false, ticket: null, reason: '' });
  const [ticketDialog, setTicketDialog] = useState({ open: false, ticket: null });
  const [downloading, setDownloading] = useState(false);
  const [ticketPreviewUrl, setTicketPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    event_id: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  useEffect(() => {
    fetchSeasonalPasses();
  }, []);

  useEffect(() => {
    const updatePreview = async () => {
      const t = ticketDialog.ticket;
      if (!ticketDialog.open || !t) {
        setTicketPreviewUrl('');
        return;
      }

      try {
        setPreviewLoading(true);
        const canvas = await renderBrandedTicketToCanvas(t, 'B');
        const url = canvas.toDataURL('image/png');
        setTicketPreviewUrl(url);
      } catch (err) {
        console.error('Ticket preview error:', err);
        setTicketPreviewUrl('');
      } finally {
        setPreviewLoading(false);
      }
    };

    updatePreview();
  }, [ticketDialog.open, ticketDialog.ticket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiRequest(`${API_BASE_URL}/tickets?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.data.tickets);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Fetch tickets error:', err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonalPasses = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/user/my-season-passes`);
      if (!response.ok) {
        throw new Error('Failed to fetch seasonal passes');
      }

      const data = await response.json();
      setSeasonalPasses(data.data || []);
    } catch (err) {
      console.error('Fetch seasonal passes error:', err);
      // Don't fail the whole page if seasonal passes fetch fails
      setSeasonalPasses([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const handleCancelTicket = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/${cancelDialog.ticket.id}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel ticket');
      }

      toast.success('Ticket cancelled successfully. Refund will be processed.');
      setCancelDialog({ open: false, ticket: null });
      fetchTickets(); // Refresh the list
    } catch (err) {
      console.error('Cancel ticket error:', err);
      toast.error(err.message || 'Failed to cancel ticket');
    }
  };

  const handleRequestRefund = async () => {
    if (!refundDialog.reason) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/${refundDialog.ticket.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: refundDialog.reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request refund');
      }

      toast.success('Refund request submitted! You will be notified once it is processed.');
      setRefundDialog({ open: false, ticket: null, reason: '' });
      fetchTickets();
    } catch (err) {
      console.error('Refund request error:', err);
      toast.error(err.message || 'Failed to request refund');
    }
  };

  const handleViewTicket = async (ticket) => {
    // For digital tickets, show the ticket display dialog
    if (ticket.ticket_format === 'digital') {
      setTicketDialog({ open: true, ticket });
    } else {
      // For physical tickets, show basic info
      toast.success('Physical ticket - Please bring your printed ticket to the event');
    }
  };

  const downloadHref = (href, filename) => {
    if (!href) return;
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTextFile = (text, filename) => {
    const blob = new Blob([String(text ?? '')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadHref(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const fetchTicketQrDataUrl = async (ticketId) => {
    const response = await apiRequest(`${API_BASE_URL}/tickets/${ticketId}/qr`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Failed to generate QR code');
    }

    return data?.qr_code || data?.data?.qr_code || null;
  };

  const renderBrandedTicketToCanvas = async (t, template = 'B') => {
    const width = 1200;
    const height = 650;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    const colors = {
      navy: '#002D68',
      pink: '#FF2D8D',
      white: '#FFFFFF',
      ink: '#0B1220',
      slate: '#334155',
      border: '#E2E8F0'
    };

    const font = {
      display: '800 36px Arial',
      title: '800 40px Arial',
      subtitle: '600 18px Arial',
      label: '700 12px Arial',
      value: '700 18px Arial',
      small: '14px Arial'
    };

    const safeText = (v) => String(v ?? '').trim();

    const formatMoney = (amount, currency) => {
      const n = Number(amount);
      if (!Number.isFinite(n)) return '';
      const cur = safeText(currency || '');
      const pretty = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
      return cur ? `${cur} ${pretty}` : pretty;
    };

    const wrapText = (text, x, y, maxWidth, lineHeight, maxLines = 2) => {
      const words = safeText(text).split(/\s+/).filter(Boolean);
      if (words.length === 0) return 0;
      const lines = [];
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) {
          line = test;
          continue;
        }
        if (line) lines.push(line);
        line = word;
        if (lines.length >= maxLines - 1) break;
      }
      if (line && lines.length < maxLines) lines.push(line);

      const final = lines.slice(0, maxLines);
      if (words.length > 0 && final.length === maxLines) {
        while (ctx.measureText(final[maxLines - 1] + '…').width > maxWidth && final[maxLines - 1].length > 0) {
          final[maxLines - 1] = final[maxLines - 1].slice(0, -1);
        }
        if (final[maxLines - 1] !== lines[maxLines - 1]) {
          final[maxLines - 1] = `${final[maxLines - 1]}…`;
        }
      }

      final.forEach((ln, idx) => ctx.fillText(ln, x, y + idx * lineHeight));
      return final.length * lineHeight;
    };

    const roundRect = (x, y, w, h, r) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    const drawGradientHeader = (x, y, w, h) => {
      const g = ctx.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, colors.navy);
      g.addColorStop(1, colors.pink);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    };

    const drawSoftBackground = () => {
      ctx.fillStyle = colors.white;
      ctx.fillRect(0, 0, width, height);

      const base = ctx.createLinearGradient(0, 0, width, height);
      base.addColorStop(0, template === 'B' ? 'rgba(0, 45, 104, 0.08)' : 'rgba(0, 45, 104, 0.05)');
      base.addColorStop(1, template === 'B' ? 'rgba(255, 45, 141, 0.10)' : 'rgba(255, 45, 141, 0.06)');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, width, height);

      if (template === 'B') {
        ctx.fillStyle = 'rgba(255, 45, 141, 0.16)';
        ctx.beginPath();
        ctx.arc(240, 540, 230, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 45, 104, 0.14)';
        ctx.beginPath();
        ctx.arc(1040, 120, 200, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 4;
        for (let y = -80; y < height + 80; y += 34) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y + 120);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(1040, 120, 240, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
        ctx.beginPath();
        ctx.arc(180, 520, 210, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 45, 104, 0.04)';
        for (let x = 70; x < width; x += 44) {
          for (let y = 60; y < height; y += 44) {
            ctx.beginPath();
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const drawTicketCard = () => {
      drawSoftBackground();

      const cardX = 40;
      const cardY = 36;
      const cardW = width - 80;
      const cardH = height - 72;

      ctx.save();
      ctx.shadowColor = 'rgba(2, 8, 23, 0.12)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = colors.white;
      roundRect(cardX, cardY, cardW, cardH, 24);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
      ctx.lineWidth = 2;
      roundRect(cardX, cardY, cardW, cardH, 24);
      ctx.stroke();

      drawGradientHeader(cardX, cardY, cardW, 124);

      // Bold-only header accents
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#ffffff';
      ctx.translate(cardX + cardW - 260, cardY - 40);
      ctx.rotate(-0.18);
      ctx.fillRect(0, 0, 220, 220);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      for (let i = 0; i < 26; i++) {
        const px = cardX + cardW - 320 + (i * 11);
        const py = cardY + 18 + ((i % 5) * 10);
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      return { cardX, cardY, cardW, cardH };
    };

    const { cardX, cardY, cardW, cardH } = drawTicketCard();

    const logoImg = await loadImage(shashaPassLogo);

    const logoH = 56;
    const logoW = Math.round((logoImg.width / logoImg.height) * logoH);
    const logoX = cardX + 32;
    const logoY = cardY + 34;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

    ctx.fillStyle = colors.white;
    ctx.font = font.display;
    ctx.fillText('ShashaPass Ticket', logoX + logoW + 18, cardY + 74);

    ctx.font = font.subtitle;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText('Official Digital Ticket', logoX + logoW + 18, cardY + 100);

    const badgeLabel = 'OFFICIAL E-TICKET';
    ctx.save();
    ctx.font = 'bold 13px Arial';
    const badgePadX = 14;
    const badgeW = Math.ceil(ctx.measureText(badgeLabel).width + badgePadX * 2);
    const badgeH = 30;
    const badgeX = cardX + cardW - badgeW - 28;
    const badgeY = cardY + 46;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    roundRect(badgeX, badgeY, badgeW, badgeH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    roundRect(badgeX, badgeY, badgeW, badgeH, 16);
    ctx.stroke();
    ctx.fillStyle = colors.white;
    ctx.fillText(badgeLabel, badgeX + badgePadX, badgeY + 20);
    ctx.restore();

    const bodyTop = cardY + 160;
    const leftX = cardX + 48;
    const rightX = cardX + cardW - 48;

    const eventTitle = safeText(t.event_title || 'Event');
    const dateText = t.event_start_date ? formatDate(t.event_start_date) : '';
    const timeText = safeText(t.event_start_time || t.start_time || t.event_time || '');
    const venueText = safeText(t.venue_name || t.event_venue || t.event_location || t.location || '');
    const ticketNumber = safeText(t.ticket_number || t.id);
    const statusText = safeText(t.status || '');
    const typeText = safeText(t.ticket_type || '');
    const seatText = t.seat_number ? `Seat ${safeText(t.seat_row || '')}${safeText(t.seat_number)}` : '';

    ctx.fillStyle = colors.ink;
    ctx.font = font.title;
    const maxTitleWidth = 680;
    const usedTitleH = wrapText(eventTitle, leftX, bodyTop, maxTitleWidth, 46, 2);

    const accentY = bodyTop + Math.max(46, usedTitleH) + 8;
    const accentW = template === 'B' ? 150 : 110;
    const accent = ctx.createLinearGradient(leftX, accentY, leftX + accentW, accentY);
    accent.addColorStop(0, colors.pink);
    accent.addColorStop(1, colors.navy);
    ctx.fillStyle = accent;
    roundRect(leftX, accentY, accentW, 6, 3);
    ctx.fill();

    const pill = (x, y, label, color) => {
      ctx.save();
      ctx.font = 'bold 14px Arial';
      const padX = 14;
      const padY = 9;
      const w = Math.ceil(ctx.measureText(label).width + padX * 2);
      const h = 32;
      ctx.fillStyle = color;
      roundRect(x, y, w, h, 16);
      ctx.fill();
      ctx.fillStyle = colors.white;
      ctx.fillText(label, x + padX, y + 22);
      ctx.restore();
      return w;
    };

    let pillX = leftX;
    const pillY = accentY + 18;
    if (statusText) pillX += pill(pillX, pillY, statusText.toUpperCase(), colors.navy) + 12;
    if (typeText) pillX += pill(pillX, pillY, typeText.toUpperCase(), colors.pink) + 12;

    const infoCardX = leftX;
    const infoCardY = pillY + 54;
    const infoCardW = 700;
    const infoCardH = 210;
    ctx.save();
    ctx.shadowColor = 'rgba(2, 8, 23, 0.08)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    roundRect(infoCardX, infoCardY, infoCardW, infoCardH, 18);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
    ctx.lineWidth = 2;
    roundRect(infoCardX, infoCardY, infoCardW, infoCardH, 18);
    ctx.stroke();

    const infoRow = (label, value, x, y) => {
      if (!safeText(value)) return;
      ctx.fillStyle = 'rgba(51, 65, 85, 0.85)';
      ctx.font = font.label;
      ctx.fillText(label.toUpperCase(), x, y);
      ctx.fillStyle = colors.ink;
      ctx.font = font.value;
      ctx.fillText(value, x, y + 26);
    };

    const col1X = infoCardX + 28;
    const col2X = infoCardX + 360;
    infoRow('Date', dateText, col1X, infoCardY + 44);
    infoRow('Time', timeText, col2X, infoCardY + 44);
    infoRow('Venue', venueText, col1X, infoCardY + 112);
    infoRow('Seat', seatText, col2X, infoCardY + 112);
    infoRow('Ticket ID', `#${ticketNumber}`, col1X, infoCardY + 180);

    const qrSize = 320;
    const qrBoxW = 380;
    const qrBoxH = 430;
    const qrBoxX = rightX - qrBoxW;
    const qrBoxY = bodyTop - 10;

    ctx.save();
    ctx.shadowColor = 'rgba(2, 8, 23, 0.10)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = colors.white;
    roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
    ctx.lineWidth = 2;
    roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22);
    ctx.stroke();

    const qrDataUrl = t.digital_format === 'qr_code' ? await fetchTicketQrDataUrl(t.id) : null;
    if (qrDataUrl) {
      const qrImg = await loadImage(qrDataUrl);
      const qrX = qrBoxX + Math.floor((qrBoxW - qrSize) / 2);
      const qrY = qrBoxY + 64;

      if (template === 'B') {
        const g = ctx.createLinearGradient(qrBoxX, qrBoxY, qrBoxX + qrBoxW, qrBoxY);
        g.addColorStop(0, 'rgba(0,45,104,0.08)');
        g.addColorStop(1, 'rgba(255,45,141,0.10)');
        ctx.fillStyle = g;
        roundRect(qrBoxX + 12, qrBoxY + 12, qrBoxW - 24, qrBoxH - 24, 18);
        ctx.fill();
      }

      ctx.fillStyle = colors.ink;
      ctx.font = 'bold 18px Arial';
      ctx.fillText('SCAN TO ENTER', qrBoxX + 28, qrBoxY + 42);

      const frameX = qrX - 14;
      const frameY = qrY - 14;
      const frameS = qrSize + 28;

      ctx.save();
      ctx.shadowColor = 'rgba(2, 8, 23, 0.10)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = colors.white;
      roundRect(frameX, frameY, frameS, frameS, 18);
      ctx.fill();
      ctx.restore();

      const borderG = ctx.createLinearGradient(frameX, frameY, frameX + frameS, frameY);
      borderG.addColorStop(0, 'rgba(0, 45, 104, 0.35)');
      borderG.addColorStop(1, 'rgba(255, 45, 141, 0.35)');
      ctx.strokeStyle = borderG;
      ctx.lineWidth = 3;
      roundRect(frameX, frameY, frameS, frameS, 18);
      ctx.stroke();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.75)';
      ctx.lineWidth = 3;
      const corner = 22;
      ctx.beginPath();
      ctx.moveTo(frameX + 16, frameY + 16 + corner);
      ctx.lineTo(frameX + 16, frameY + 16);
      ctx.lineTo(frameX + 16 + corner, frameY + 16);
      ctx.moveTo(frameX + frameS - 16 - corner, frameY + 16);
      ctx.lineTo(frameX + frameS - 16, frameY + 16);
      ctx.lineTo(frameX + frameS - 16, frameY + 16 + corner);
      ctx.moveTo(frameX + 16, frameY + frameS - 16 - corner);
      ctx.lineTo(frameX + 16, frameY + frameS - 16);
      ctx.lineTo(frameX + 16 + corner, frameY + frameS - 16);
      ctx.moveTo(frameX + frameS - 16 - corner, frameY + frameS - 16);
      ctx.lineTo(frameX + frameS - 16, frameY + frameS - 16);
      ctx.lineTo(frameX + frameS - 16, frameY + frameS - 16 - corner);
      ctx.stroke();

      ctx.fillStyle = colors.slate;
      ctx.font = '14px Arial';
      ctx.fillText('Present this QR at the entrance', qrBoxX + 28, qrBoxY + qrBoxH - 26);
    } else {
      ctx.fillStyle = colors.slate;
      ctx.font = '16px Arial';
      ctx.fillText('No QR available for this ticket format.', qrBoxX + 28, qrBoxY + 120);
    }

    if (template === 'B') {
      const cutX = qrBoxX - 24;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(cutX, cardY + 140);
      ctx.lineTo(cutX, cardY + cardH - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(cutX - 18, cardY + cardH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = colors.pink;
      ctx.font = 'bold 24px Arial';
      ctx.fillText('ADMIT ONE', -70, 0);
      ctx.restore();
    }

    const attendeeName = safeText(
      t.attendee_name ||
      t.attendee ||
      t.holder_name ||
      t.customer_name ||
      t.user_name ||
      t.full_name ||
      t.name ||
      ''
    );
    const orderRef = safeText(
      t.order_reference ||
      t.order_ref ||
      t.order_number ||
      t.order_id ||
      t.payment_reference ||
      t.payment_ref ||
      t.payment_id ||
      ''
    );
    const priceText = formatMoney(
      t.amount_paid ?? t.total_amount ?? t.total ?? t.amount ?? t.price ?? t.base_price,
      t.currency
    );

    const footerX = cardX + 32;
    const footerY = cardY + cardH - 118;
    const footerW = Math.max(360, qrBoxX - 24 - footerX);
    const footerH = 86;

    ctx.save();
    ctx.shadowColor = 'rgba(2, 8, 23, 0.06)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.96)';
    roundRect(footerX, footerY, footerW, footerH, 16);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.95)';
    ctx.lineWidth = 2;
    roundRect(footerX, footerY, footerW, footerH, 16);
    ctx.stroke();

    const footerLabel = (text, x, y) => {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.85)';
      ctx.font = font.label;
      ctx.fillText(text.toUpperCase(), x, y);
    };

    const footerValue = (text, x, y) => {
      if (!safeText(text)) return;
      ctx.fillStyle = colors.ink;
      ctx.font = font.value;
      ctx.fillText(text, x, y);
    };

    const fx1 = footerX + 18;
    const fx2 = footerX + Math.floor(footerW * 0.56);
    footerLabel('Attendee', fx1, footerY + 28);
    footerValue(attendeeName || '—', fx1, footerY + 54);
    footerLabel('Price', fx2, footerY + 28);
    footerValue(priceText || '—', fx2, footerY + 54);

    const terms = 'One entry only • No resale • Present QR at the gate';
    footerLabel('Order ref', fx1, footerY + 78);
    ctx.fillStyle = 'rgba(71, 85, 105, 0.92)';
    ctx.font = '700 13px Arial';
    ctx.fillText(orderRef || '—', fx1 + 78, footerY + 78);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.95)';
    ctx.font = '12px Arial';
    ctx.fillText(terms, fx2, footerY + 78);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.95)';
    ctx.font = '14px Arial';
    ctx.fillText('© 2026 ShashaPass', cardX + 32, cardY + cardH - 20);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.95)';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`#${ticketNumber}`, cardX + cardW - 130, cardY + cardH - 20);

    return canvas;
  };

  const downloadBrandedTicketPng = async () => {
    const t = ticketDialog.ticket;
    if (!t) return;

    try {
      setDownloading(true);
      const canvas = await renderBrandedTicketToCanvas(t, 'B');
      const dataUrl = canvas.toDataURL('image/png');
      downloadHref(dataUrl, `ticket-${t.ticket_number || t.id}.png`);
      toast.success('PNG ticket downloaded');
    } catch (err) {
      console.error('PNG ticket download error:', err);
      toast.error(err.message || 'Failed to download PNG');
    } finally {
      setDownloading(false);
    }
  };

  const downloadBrandedTicketPdf = async () => {
    const t = ticketDialog.ticket;
    if (!t) return;

    try {
      setDownloading(true);
      const canvas = await renderBrandedTicketToCanvas(t, 'B');
      const dataUrl = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ticket-${t.ticket_number || t.id}.pdf`);
      toast.success('PDF ticket downloaded');
    } catch (err) {
      console.error('PDF ticket download error:', err);
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCurrentTicket = async () => {
    const t = ticketDialog.ticket;
    if (!t) return;

    try {
      if (t.ticket_format !== 'digital') {
        toast.error('This ticket is not downloadable.');
        return;
      }

      const safeTicketNumber = t.ticket_number || t.id;

      if (t.digital_format === 'qr_code') {
        const response = await apiRequest(`${API_BASE_URL}/tickets/${t.id}/qr`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || 'Failed to generate QR code');
        }

        const qr = data?.qr_code || data?.data?.qr_code;
        if (!qr) {
          throw new Error('QR code not available');
        }

        downloadHref(qr, `ticket-${safeTicketNumber}-qr.png`);
        toast.success('Ticket downloaded');
        return;
      }

      if (t.digital_format === 'barcode') {
        downloadTextFile(t.qr_code_data || safeTicketNumber, `ticket-${safeTicketNumber}-barcode.txt`);
        toast.success('Ticket downloaded');
        return;
      }

      if (t.digital_format === 'nfc') {
        downloadTextFile(t.nfc_data || '', `ticket-${safeTicketNumber}-nfc.txt`);
        toast.success('Ticket downloaded');
        return;
      }

      if (t.digital_format === 'rfid') {
        downloadTextFile(t.rfid_data || '', `ticket-${safeTicketNumber}-rfid.txt`);
        toast.success('Ticket downloaded');
        return;
      }

      toast.error('Unsupported ticket format');
    } catch (err) {
      console.error('Download ticket error:', err);
      toast.error(err.message || 'Failed to download ticket');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      reserved: 'warning',
      used: 'info',
      cancelled: 'error',
      refunded: 'secondary',
      expired: 'default',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelTicket = (ticket) => {
    const eventDate = new Date(ticket.event_start_date);
    const now = new Date();
    return ticket.status === 'confirmed' && eventDate > now;
  };

  const LoadingSkeleton = () => (
    <Box>
      {[...Array(5)].map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width={80} height={36} />
                  <Skeleton variant="rectangular" width={80} height={36} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your event tickets and reservations
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Event ID (optional)"
              value={filters.event_id}
              onChange={(e) => handleFilterChange('event_id', e.target.value)}
              placeholder="Filter by specific event"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setFilters({
                page: 1,
                limit: 10,
                status: '',
                event_id: '',
              })}
              sx={{ height: 56 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Regular Tickets" value="regular" />
          <Tab label={`Season Passes (${seasonalPasses.length})`} value="seasonal" />
        </Tabs>
      </Box>

      {/* Regular Tickets Tab */}
      {activeTab === 'regular' && (
        <>
          {loading ? (
            <LoadingSkeleton />
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ConfirmationNumber sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No tickets found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't purchased any tickets yet. Browse events to get started.
              </Typography>
              <Button variant="contained" href="/events">
                Browse Events
              </Button>
            </Box>
          ) : (
            <>
              {/* Mobile View */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {tickets.map((ticket) => {
              // Parse metadata to determine item type
              const metadata = ticket.metadata 
                ? (typeof ticket.metadata === 'string' ? JSON.parse(ticket.metadata) : ticket.metadata)
                : {};
              const itemType = metadata?.item_type || ticket.ticket_type || (ticket.event_title ? 'event' : 'unknown');
              
              // Determine display values based on item type
              const getTitle = () => {
                switch(itemType) {
                  case 'bus': return `🚌 Bus: ${metadata.destination || 'N/A'}`;
                  case 'flight': 
                    const dep = metadata.departure?.airport || metadata.departure?.city || '';
                    const arr = metadata.arrival?.airport || metadata.arrival?.city || '';
                    return `✈️ Flight: ${metadata.airline || ''} ${dep && arr ? `${dep} → ${arr}` : ''}`;
                  case 'hotel': return `🏨 Hotel: ${metadata.hotel_code || metadata.location || 'N/A'}`;
                  default: return ticket.event_title || 'Ticket';
                }
              };

              const getSubtitle = () => {
                switch(itemType) {
                  case 'bus': return `${metadata.seats || metadata.passengers || 1} passenger(s)`;
                  case 'flight': return `${metadata.passengers || 1} passenger(s) • ${metadata.contact_info?.email || ''}`;
                  case 'hotel': return `${metadata.rooms || 1} room(s) • Check-in: ${metadata.check_in || 'N/A'}`;
                  default: return ticket.seat_number ? `Seat ${ticket.seat_row}${ticket.seat_number}` : 'General admission';
                }
              };

              const getIcon = () => {
                switch(itemType) {
                  case 'bus': return '🚌';
                  case 'flight': return '✈️';
                  case 'hotel': return '🏨';
                  default: return '🎫';
                }
              };

              const getDate = () => {
                switch(itemType) {
                  case 'bus': return metadata.departure_time ? formatDate(metadata.departure_time) : 'N/A';
                  case 'flight': 
                    const depTime = metadata.departure?.time || metadata.departure_time;
                    return depTime ? formatDate(depTime) : 'N/A';
                  case 'hotel': return metadata.check_in ? formatDate(metadata.check_in) : 'N/A';
                  default: return ticket.event_start_date ? formatDate(ticket.event_start_date) : 'N/A';
                }
              };

              // Type-specific gradient colors
              const getGradient = () => {
                switch(itemType) {
                  case 'flight': return 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)';
                  case 'bus': return 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)';
                  case 'hotel': return 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 50%, #7b1fa2 100%)';
                  default: return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #fbb03b 100%)';
                }
              };

              // Render Flight Boarding Pass Style
              if (itemType === 'flight') {
                const dep = metadata.departure || {};
                const arr = metadata.arrival || {};
                return (
                  <Card key={ticket.id} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    {/* Header */}
                    <Box sx={{ background: getGradient(), color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ fontSize: '2rem' }}>✈️</Box>
                        <Box>
                          <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>BOARDING PASS</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{metadata.airline || 'Airline'}</Typography>
                        </Box>
                      </Box>
                      <Chip label={ticket.status?.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                    </Box>
                    
                    {/* Flight Route */}
                    <Box sx={{ p: 3, bgcolor: '#f8fafc' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a237e' }}>{dep.airport || 'DEP'}</Typography>
                          <Typography variant="body2" color="text.secondary">{dep.city || 'Departure'}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{dep.time ? new Date(dep.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Box sx={{ width: 40, height: 2, bgcolor: '#1a237e' }} />
                            <Box sx={{ fontSize: '1.5rem' }}>✈️</Box>
                            <Box sx={{ width: 40, height: 2, bgcolor: '#1a237e' }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{metadata.duration || 'Direct'}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a237e' }}>{arr.airport || 'ARR'}</Typography>
                          <Typography variant="body2" color="text.secondary">{arr.city || 'Arrival'}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>{arr.time ? new Date(arr.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Passenger & Flight Info */}
                    <Box sx={{ p: 2, borderTop: '2px dashed #e0e0e0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">PASSENGER</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{metadata.passenger_details?.[0]?.firstName || 'Guest'} {metadata.passenger_details?.[0]?.lastName || ''}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">FLIGHT</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{metadata.flight_number || ticket.ticket_number}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">DATE</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{getDate()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">BOOKING REF</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a237e' }}>{ticket.ticket_number}</Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="contained" startIcon={<QrCode />} onClick={() => handleViewTicket(ticket)} sx={{ background: getGradient() }}>View Pass</Button>
                      {canCancelTicket(ticket) && <Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialog({ open: true, ticket })}>Cancel</Button>}
                    </Box>
                  </Card>
                );
              }

              // Render Bus Ticket Style
              if (itemType === 'bus') {
                return (
                  <Card key={ticket.id} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    <Box sx={{ background: getGradient(), color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ fontSize: '2rem' }}>🚌</Box>
                        <Box>
                          <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>BUS TICKET</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{metadata.bus_name || 'Bus Service'}</Typography>
                        </Box>
                      </Box>
                      <Chip label={ticket.status?.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                    </Box>

                    <Box sx={{ p: 3, bgcolor: '#f0fdf4' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5} sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20' }}>{metadata.origin || 'FROM'}</Typography>
                          <Typography variant="body2" color="text.secondary">Departure</Typography>
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'center' }}>
                          <Box sx={{ fontSize: '2rem' }}>→</Box>
                        </Grid>
                        <Grid item xs={5} sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1b5e20' }}>{metadata.destination || 'TO'}</Typography>
                          <Typography variant="body2" color="text.secondary">Arrival</Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ p: 2, borderTop: '2px dashed #c8e6c9', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box><Typography variant="caption" color="text.secondary">DEPARTURE</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{getDate()}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">SEATS</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{metadata.seats || metadata.passengers || 1}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">TICKET NO</Typography><Typography variant="body1" sx={{ fontWeight: 700, color: '#1b5e20' }}>{ticket.ticket_number}</Typography></Box>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#e8f5e9', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="contained" startIcon={<QrCode />} onClick={() => handleViewTicket(ticket)} sx={{ background: getGradient() }}>View Ticket</Button>
                      {canCancelTicket(ticket) && <Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialog({ open: true, ticket })}>Cancel</Button>}
                    </Box>
                  </Card>
                );
              }

              // Render Hotel Confirmation Style
              if (itemType === 'hotel') {
                return (
                  <Card key={ticket.id} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    <Box sx={{ background: getGradient(), color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ fontSize: '2rem' }}>🏨</Box>
                        <Box>
                          <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>HOTEL CONFIRMATION</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{metadata.hotel_name || 'Hotel Booking'}</Typography>
                        </Box>
                      </Box>
                      <Chip label={ticket.status?.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                    </Box>

                    <Box sx={{ p: 3, bgcolor: '#faf5ff' }}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, textAlign: 'center', border: '2px solid #e9d5ff' }}>
                            <Typography variant="caption" color="text.secondary">CHECK-IN</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4a148c' }}>{metadata.check_in ? new Date(metadata.check_in).toLocaleDateString() : 'N/A'}</Typography>
                            <Typography variant="body2" color="text.secondary">From 2:00 PM</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, textAlign: 'center', border: '2px solid #e9d5ff' }}>
                            <Typography variant="caption" color="text.secondary">CHECK-OUT</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4a148c' }}>{metadata.check_out ? new Date(metadata.check_out).toLocaleDateString() : 'N/A'}</Typography>
                            <Typography variant="body2" color="text.secondary">Until 11:00 AM</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ p: 2, borderTop: '2px dashed #e9d5ff', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box><Typography variant="caption" color="text.secondary">LOCATION</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{metadata.location || 'N/A'}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">ROOMS</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{metadata.rooms || 1}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">CONFIRMATION</Typography><Typography variant="body1" sx={{ fontWeight: 700, color: '#4a148c' }}>{ticket.ticket_number}</Typography></Box>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#f3e8ff', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="contained" startIcon={<QrCode />} onClick={() => handleViewTicket(ticket)} sx={{ background: getGradient() }}>View Details</Button>
                      {canCancelTicket(ticket) && <Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialog({ open: true, ticket })}>Cancel</Button>}
                    </Box>
                  </Card>
                );
              }

              // Default Event Ticket Style
              return (
                <Card key={ticket.id} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                  <Box sx={{ background: getGradient(), color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ fontSize: '2rem' }}>🎫</Box>
                      <Box>
                        <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>EVENT TICKET</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{ticket.event_title || 'Event'}</Typography>
                      </Box>
                    </Box>
                    <Chip label={ticket.status?.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ p: 3, bgcolor: '#fff7ed' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={8}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#c2410c', mb: 1 }}>{ticket.event_title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <AccessTime sx={{ fontSize: 18, color: '#9a3412' }} />
                          <Typography variant="body1">{ticket.event_start_date ? new Date(ticket.event_start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 18, color: '#9a3412' }} />
                          <Typography variant="body1">{ticket.venue_name || 'Venue TBA'}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        {ticket.seat_number && (
                          <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, display: 'inline-block', border: '2px solid #fed7aa' }}>
                            <Typography variant="caption" color="text.secondary">SEAT</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#c2410c' }}>{ticket.seat_row}{ticket.seat_number}</Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ p: 2, borderTop: '2px dashed #fed7aa', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box><Typography variant="caption" color="text.secondary">TICKET TYPE</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>{ticket.ticket_type || 'General'}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">PRICE</Typography><Typography variant="body1" sx={{ fontWeight: 600 }}>KES {Number(ticket.total_amount || 0).toLocaleString()}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">TICKET NO</Typography><Typography variant="body1" sx={{ fontWeight: 700, color: '#c2410c' }}>{ticket.ticket_number}</Typography></Box>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#ffedd5', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {ticket.has_streaming_access && <Button size="small" variant="contained" startIcon={<QrCode />} onClick={() => navigate(`/stream/${ticket.id}`)} sx={{ background: getGradient() }}>Watch Stream</Button>}
                    <Button size="small" variant="contained" startIcon={<QrCode />} onClick={() => handleViewTicket(ticket)} sx={{ background: getGradient() }}>QR Code</Button>
                    {canCancelTicket(ticket) && <Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setCancelDialog({ open: true, ticket })}>Cancel</Button>}
                    {(ticket.status === 'confirmed' || ticket.status === 'used') && <Button size="small" variant="outlined" color="warning" onClick={() => setRefundDialog({ ...refundDialog, open: true, ticket })}>Refund</Button>}
                    <Button size="small" variant="outlined" startIcon={<Share />} onClick={() => { navigator.share?.({ title: `Ticket: ${ticket.ticket_number}`, text: `My ticket for ${ticket.event_title}`, url: window.location.href }) || navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }}>Share</Button>
                  </Box>
                </Card>
              );
          })}
            </Box>

            {/* Desktop View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Ticket Number</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => {
                    // Parse metadata to determine item type
                    const metadata = ticket.metadata 
                      ? (typeof ticket.metadata === 'string' ? JSON.parse(ticket.metadata) : ticket.metadata)
                      : {};
                    const itemType = metadata?.item_type || ticket.ticket_type || (ticket.event_title ? 'event' : 'unknown');
                    
                    const getTitle = () => {
                      switch(itemType) {
                        case 'bus': return `Bus: ${metadata.destination || 'N/A'}`;
                        case 'flight': return `Flight: ${metadata.airline || 'N/A'}`;
                        case 'hotel': return `Hotel: ${metadata.location || 'N/A'}`;
                        default: return ticket.event_title || 'Ticket';
                      }
                    };

                    const getDate = () => {
                      switch(itemType) {
                        case 'bus': return metadata.departure_time ? formatDate(metadata.departure_time) : 'N/A';
                        case 'flight': return metadata.departure_time ? formatDate(metadata.departure_time) : 'N/A';
                        case 'hotel': return metadata.check_in ? formatDate(metadata.check_in) : 'N/A';
                        default: return ticket.event_start_date ? formatDate(ticket.event_start_date) : 'N/A';
                      }
                    };

                    const getIcon = () => {
                      switch(itemType) {
                        case 'bus': return '🚌';
                        case 'flight': return '✈️';
                        case 'hotel': return '🏨';
                        default: return '🎫';
                      }
                    };

                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '1.3rem' }}>
                            {getIcon()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {ticket.ticket_number}
                          </Typography>
                        </TableCell>
                        <TableCell>{getTitle()}</TableCell>
                        <TableCell>{getDate()}</TableCell>
                        <TableCell>${ticket.total_amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status}
                            size="small"
                            color={getStatusColor(ticket.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {ticket.status === 'confirmed' && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<QrCode />}
                                onClick={() => handleViewTicket(ticket)}
                              >
                                {itemType === 'event' ? 'QR' : 'View'}
                              </Button>
                            )}

                            {ticket.has_streaming_access && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={<QrCode />}
                                onClick={() => navigate(`/stream/${ticket.id}`)}
                              >
                                Watch Stream
                              </Button>
                            )}

                            {canCancelTicket(ticket) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => setCancelDialog({ open: true, ticket })}
                              >
                                Cancel
                              </Button>
                            )}

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Share />}
                              onClick={() => {
                                navigator.share?.({
                                  title: `Ticket: ${ticket.ticket_number}`,
                                  text: `My ticket - ${getTitle()}`,
                                  url: window.location.href,
                                }) || navigator.clipboard.writeText(window.location.href);
                                toast.success('Ticket link copied');
                              }}
                            >
                              Share
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  disabled={pagination.page === 1}
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                >
                  Previous
                </Button>
                <Typography sx={{ alignSelf: 'center', mx: 2 }}>
                  Page {pagination.page} of {pagination.pages}
                </Typography>
                <Button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          </Box>
            </>
          )}
            </>
          )}

      {/* Seasonal Passes Tab */}
      {activeTab === 'seasonal' && (
        <>
          {seasonalPasses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Event sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No season passes yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Get unlimited access to your favorite events with season passes.
              </Typography>
              <Button variant="contained" href="/seasonal-tickets">
                Browse Season Passes
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {seasonalPasses.map((pass) => (
                <Grid item xs={12} sm={6} md={4} key={pass.purchase_id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {pass.image_url && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          backgroundImage: `url(${pass.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {pass.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                        {pass.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={`${pass.season_type.replace('-', ' ').toUpperCase()} ${pass.season_year}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${pass.total_events} Events`}
                          size="small"
                          color="primary"
                        />
                      </Box>

                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Purchase Reference
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {pass.reference_code}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/seasonal-tickets/${pass.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Cancel Ticket Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, ticket: null })}>
        <DialogTitle>Cancel Ticket</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to cancel this ticket? This action cannot be undone.
          </Typography>
          {cancelDialog.ticket && (
            <Box>
              <Typography variant="body2">
                <strong>Ticket:</strong> {cancelDialog.ticket.ticket_number}
              </Typography>
              <Typography variant="body2">
                <strong>Event:</strong> {cancelDialog.ticket.event_title}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> ${cancelDialog.ticket.total_amount}
              </Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            Refund will be processed according to the event's refund policy.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, ticket: null })}>
            Keep Ticket
          </Button>
          <Button onClick={handleCancelTicket} variant="contained" color="error">
            Cancel Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ ...refundDialog, open: false, reason: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {refundDialog.ticket && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Ticket:</strong> {refundDialog.ticket.ticket_number}
                  <br />
                  <strong>Amount:</strong> ${refundDialog.ticket.total_amount}
                </Alert>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Refund"
                  placeholder="Please explain why you are requesting a refund..."
                  value={refundDialog.reason}
                  onChange={(e) => setRefundDialog({ ...refundDialog, reason: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Alert severity="warning">
                  Refund requests are reviewed by our team and processed according to the event's refund policy. You will receive an email notification with the decision.
                </Alert>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog({ ...refundDialog, open: false, reason: '' })}>
            Cancel
          </Button>
          <Button onClick={handleRequestRefund} variant="contained" color="warning">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={ticketDialog.open} onClose={() => setTicketDialog({ open: false, ticket: null })} maxWidth="sm">
        <DialogTitle>
          {ticketDialog.ticket?.ticket_format === 'digital'
            ? `${ticketDialog.ticket?.digital_format?.replace('_', ' ').toUpperCase()} Ticket`
            : 'Physical Ticket'
          } - {ticketDialog.ticket?.ticket_number}
        </DialogTitle>
        <DialogContent>
          {ticketDialog.ticket && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {ticketDialog.ticket.ticket_number}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {ticketDialog.ticket.event_title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatDate(ticketDialog.ticket.event_start_date)}
              </Typography>

              {/* Display appropriate ticket format component */}
              {ticketDialog.ticket.digital_format === 'qr_code' && (
                <QRCodeDisplay ticket={ticketDialog.ticket} />
              )}

              {ticketDialog.ticket.digital_format === 'nfc' && (
                <NFCDisplay ticket={ticketDialog.ticket} />
              )}

              {ticketDialog.ticket.digital_format === 'rfid' && (
                <RFIDDisplay ticket={ticketDialog.ticket} />
              )}

              {ticketDialog.ticket.digital_format === 'barcode' && (
                <Paper sx={{ p: 3, textAlign: 'center', mt: 2, mx: 'auto', maxWidth: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Barcode Ticket
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '1.5rem',
                      letterSpacing: 2,
                      fontWeight: 'bold',
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {ticketDialog.ticket.qr_code_data || ticketDialog.ticket.ticket_number}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Show this barcode at the event entrance for validation.
                  </Alert>
                </Paper>
              )}

              {ticketDialog.ticket.ticket_format === 'physical' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Physical Ticket</strong>
                  </Typography>
                  <Typography variant="body2">
                    Your physical ticket has been mailed to your registered address.
                    Please bring it to the event for validation.
                  </Typography>
                </Alert>
              )}

              <Box sx={{ mt: 3 }}>
                {previewLoading ? (
                  <Skeleton variant="rounded" height={220} sx={{ maxWidth: 520, mx: 'auto' }} />
                ) : (
                  ticketPreviewUrl && (
                    <Box
                      component="img"
                      src={ticketPreviewUrl}
                      alt="Ticket preview"
                      sx={{
                        width: '100%',
                        maxWidth: 520,
                        borderRadius: 2,
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        boxShadow: '0 8px 22px rgba(2, 8, 23, 0.10)',
                        mx: 'auto',
                        display: 'block'
                      }}
                    />
                  )
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialog({ open: false, ticket: null })}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadBrandedTicketPng}
            disabled={downloading}
          >
            Download PNG
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={downloadBrandedTicketPdf}
            disabled={downloading}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      </Container>
    
  );
};

export default TicketsPage;
