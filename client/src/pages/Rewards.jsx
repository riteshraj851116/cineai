import React, { useState, useEffect } from 'react';
import { rewardService } from '../services/rewardService';
import { useAuth } from '../context/AuthContext';
import { CineCard } from '../components/ui/CineCard';
import { CineButton } from '../components/ui/CineButton';
import { CineBadge } from '../components/ui/CineBadge';
import { CineLoader } from '../components/ui/CineLoader';
import {
  Award,
  Gift,
  Sparkles,
  CheckCircle2,
  Ticket,
  Coffee,
  Popcorn,
  Crown,
  Copy,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Rewards = () => {
  const [loyalty, setLoyalty] = useState(null);
  const [rewardsList, setRewardsList] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchLoyaltyAndRewards = async () => {
    try {
      const [rewardsRes, loyaltyRes] = await Promise.allSettled([
        rewardService.getRewardsCatalog(),
        rewardService.getLoyaltyBalance(),
      ]);

      if (rewardsRes.status === 'fulfilled' && rewardsRes.value.data?.success) {
        setRewardsList(rewardsRes.value.data.rewards || []);
        if (rewardsRes.value.data.redemptions) {
          setRedemptions(rewardsRes.value.data.redemptions);
        }
      }

      if (loyaltyRes.status === 'fulfilled' && loyaltyRes.value.data?.success) {
        setLoyalty(loyaltyRes.value.data.loyalty || loyaltyRes.value.data);
      } else if (rewardsRes.status === 'fulfilled' && rewardsRes.value.data?.userPoints !== undefined) {
        setLoyalty({ points: rewardsRes.value.data.userPoints, tier: 'Silver' });
      }
    } catch (err) {
      console.error('Failed to load rewards data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyAndRewards();
  }, []);

  const getRewardIcon = (iconName) => {
    switch (iconName) {
      case 'Popcorn':
        return <Popcorn size={22} color="var(--cine-accent)" />;
      case 'Ticket':
        return <Ticket size={22} color="#10B981" />;
      case 'Sparkles':
        return <Sparkles size={22} color="#F59E0B" />;
      case 'Coffee':
        return <Coffee size={22} color="#EC4899" />;
      case 'Crown':
        return <Crown size={22} color="#8B5CF6" />;
      default:
        return <Gift size={22} color="var(--cine-accent)" />;
    }
  };

  const handleRedeem = async (item) => {
    const userPoints = loyalty?.points ?? (user?.loyaltyPoints || 450);
    if (userPoints < item.pointsRequired) {
      alert(`Insufficient CinePoints balance. You need ${item.pointsRequired} points.`);
      return;
    }

    setRedeeming(true);
    try {
      const { data } = await rewardService.redeemReward(item._id);
      if (data.success) {
        setRedeemedVoucher({
          title: item.title,
          issuedCode: data.issuedCode,
          cost: item.pointsRequired,
          remainingPoints: data.remainingPoints,
        });

        // Update local points
        setLoyalty((prev) => ({
          ...prev,
          points: data.remainingPoints,
        }));

        // Refresh rewards and redemption list
        fetchLoyaltyAndRewards();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CineLoader text="Auditing patron rewards balance & perks catalog..." />
      </div>
    );
  }

  const points = loyalty?.points ?? (user?.loyaltyPoints || 450);
  const tierName = loyalty?.tier || (points > 1000 ? 'Platinum VIP' : points > 400 ? 'Gold Elite' : 'Silver Patron');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cine-bg)', color: 'var(--cine-text)', paddingTop: '100px', paddingBottom: '100px' }}>
      <div className="cine-container">
        {/* Masthead Banner */}
        <CineCard style={{ padding: '36px', marginBottom: '40px', border: '1px solid var(--cine-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--cine-accent)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                <Award size={14} />
                <span>PATRON LOYALTY PRIVILEGES</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                CINEPOINTS CLUB
              </h1>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>
                Earn 10% CinePoints on every ticket reservation and gourmet concession order. Redeem for admissions & perks.
              </p>
            </div>

            <div style={{ background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', borderRadius: 'var(--cine-radius-md)', padding: '16px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--cine-text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>AVAILABLE BALANCE</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--cine-accent)', fontFamily: 'var(--cine-font-mono)' }}>
                {points} PTS
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>
                {tierName}
              </div>
            </div>
          </div>
        </CineCard>

        {/* Redemption Catalog */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                Available Rewards Catalog
              </h2>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Instant digital voucher delivery right to your order checkout.
              </p>
            </div>
            <CineBadge variant="accent">{rewardsList.length} PRIVILEGES READY</CineBadge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {rewardsList.map((item) => (
              <CineCard key={item._id} style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--cine-radius-md)', background: 'var(--cine-surface-2)', border: '1px solid var(--cine-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getRewardIcon(item.icon)}
                  </div>
                  <CineBadge variant={points >= item.pointsRequired ? 'primary' : 'outline'}>
                    {item.pointsRequired} PTS
                  </CineBadge>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0' }}>{item.title}</h3>
                <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 24px 0', flex: 1 }}>
                  {item.description}
                </p>

                <CineButton
                  variant={points >= item.pointsRequired ? 'primary' : 'outline'}
                  size="sm"
                  disabled={points < item.pointsRequired || redeeming}
                  onClick={() => handleRedeem(item)}
                  style={{ width: '100%' }}
                >
                  <Gift size={14} />
                  <span>{points >= item.pointsRequired ? 'REDEEM VOUCHER' : `${item.pointsRequired - points} PTS NEEDED`}</span>
                </CineButton>
              </CineCard>
            ))}
          </div>
        </div>

        {/* Previous Redemptions Ledger */}
        {redemptions.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Your Active Redemptions & Vouchers
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {redemptions.map((red) => (
                <CineCard key={red._id} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{red.reward?.title || 'CineAI Exclusive Reward'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cine-text-muted)', marginTop: '4px' }}>
                      Spent {red.pointsSpent} pts • Expires {new Date(red.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--cine-font-mono)', fontWeight: 800, color: 'var(--cine-accent)', background: 'var(--cine-surface-2)', padding: '6px 12px', borderRadius: 'var(--cine-radius-sm)', border: '1px dashed var(--cine-border)' }}>
                      {red.issuedCode}
                    </span>
                    <CineButton size="sm" variant="ghost" onClick={() => handleCopyCode(red.issuedCode)}>
                      <Copy size={14} />
                    </CineButton>
                  </div>
                </CineCard>
              ))}
            </div>
          </div>
        )}

        {/* Voucher Modal */}
        {redeemedVoucher && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <CineCard style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '8px' }}>Reward Claimed!</h3>
              <p style={{ color: 'var(--cine-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {redeemedVoucher.title} has been unlocked. Apply this voucher code during checkout for instant redemption.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--cine-surface-2)', border: '1px dashed var(--cine-border)', padding: '14px', borderRadius: 'var(--cine-radius-sm)', fontFamily: 'var(--cine-font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--cine-accent)', marginBottom: '20px' }}>
                <span>{redeemedVoucher.issuedCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(redeemedVoucher.issuedCode)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--cine-text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Copy Voucher Code"
                >
                  {copiedCode ? <Check size={18} color="#10B981" /> : <Copy size={18} />}
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--cine-text-muted)', marginBottom: '24px' }}>
                Remaining Balance: <strong style={{ color: 'var(--cine-text)' }}>{redeemedVoucher.remainingPoints} CinePoints</strong>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <CineButton variant="outline" onClick={() => setRedeemedVoucher(null)} style={{ flex: 1 }}>
                  CLOSE
                </CineButton>
                <CineButton variant="primary" onClick={() => { setRedeemedVoucher(null); navigate('/movies'); }} style={{ flex: 1 }}>
                  USE NOW
                </CineButton>
              </div>
            </CineCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;

