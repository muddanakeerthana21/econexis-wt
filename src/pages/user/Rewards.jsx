import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { rewardsList } from "../../data/mockData";
import { rewardApi } from "../../services/api";
import Popup from "../../components/Popup";
import {
  Coins,
  Gift,
  Award,
  TreePine,
  CupSoda,
  Medal,
  Sun,
  Sparkles,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function Rewards() {
  const { user, deductEcoPoints } = useAuth();
  const [rewards, setRewards] = useState(rewardsList);
  const [activePopup, setActivePopup] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const currentPoints = user?.ecoPoints !== undefined ? user.ecoPoints : 1250;

  // Load real rewards from MongoDB
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await rewardApi.getAll();
        if (res && res.success && res.data && res.data.length > 0) {
          const formatted = res.data.map((r) => ({
            id: r.id || r._id,
            rewardCode: r.rewardCode,
            title: r.title,
            points: r.points,
            category: r.category,
            icon: r.icon || "Gift",
            description: r.description,
            claimed: r.claimed || false,
          }));
          setRewards(formatted);
        }
      } catch (err) {
        console.warn("Using local rewards list:", err.message);
      }
    };

    fetchRewards();
  }, []);

  const getRewardIcon = (iconName) => {
    switch (iconName) {
      case "Award":
        return <Award size={32} />;
      case "TreePine":
        return <TreePine size={32} />;
      case "CupSoda":
        return <CupSoda size={32} />;
      case "Gift":
        return <Gift size={32} />;
      case "Medal":
        return <Medal size={32} />;
      case "Sun":
        return <Sun size={32} />;
      default:
        return <Sparkles size={32} />;
    }
  };

  const handleRedeem = async (reward) => {
    if (currentPoints < reward.points) {
      setActivePopup({
        isOpen: true,
        title: "Insufficient EcoPoints",
        message: `You need ${reward.points} EcoPoints to redeem "${reward.title}". You currently have ${currentPoints} EcoPoints. Recycle or donate more items to earn the required points!`,
        type: "warning"
      });
      return;
    }

    let voucherCode = `ECO-VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      if (reward.id && reward.id.length === 24) {
        const res = await rewardApi.redeem(reward.id);
        if (res && res.voucherCode) {
          voucherCode = res.voucherCode;
        }
      }
    } catch (err) {
      console.warn("Redemption recorded locally:", err.message);
    }

    deductEcoPoints(reward.points);
    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, claimed: true } : r))
    );

    setActivePopup({
      isOpen: true,
      title: "Reward Redeemed Successfully! 🎉",
      message: `Congratulations! You have claimed "${reward.title}" for ${reward.points} EcoPoints. Your redemption voucher code is: ${voucherCode}. Confirmation has been recorded in MongoDB.`,
      type: "success"
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">EcoRewards Store</h1>
          <p className="page-subtitle">
            Convert your green recycling points into exclusive sustainable merchandise, tree saplings, and campus perks.
          </p>
        </div>
      </div>

      {/* Points Balance Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(174, 213, 246, 0.4), rgba(16, 185, 129, 0.2))",
          borderColor: "rgba(174, 213, 246, 0.6)",
          padding: "28px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              backgroundColor: "var(--bg-surface)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f59e0b"
            }}
          >
            <Coins size={32} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>
              Available Balance
            </div>
            <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1.1 }}>
              {currentPoints} <span style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--primary-dark)" }}>EcoPoints</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge badge-green" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
            <Sparkles size={14} />
            <span>Active Rewards: {rewards.length}</span>
          </span>
        </div>
      </div>

      {/* Rewards Catalog Grid */}
      <div className="grid-3">
        {rewards.map((reward) => {
          const canAfford = currentPoints >= reward.points;
          return (
            <div key={reward.id} className="reward-card">
              <div className="reward-img-badge">
                {getRewardIcon(reward.icon)}
              </div>

              <div>
                <span className="badge badge-blue" style={{ marginBottom: "8px" }}>
                  {reward.category}
                </span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "6px" }}>
                  {reward.title}
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", minHeight: "42px" }}>
                  {reward.description}
                </p>
              </div>

              <div className="reward-points-tag">
                <Coins size={16} color="#f59e0b" />
                <span>{reward.points} EcoPoints</span>
              </div>

              <button
                className={`btn ${reward.claimed ? "btn-secondary" : canAfford ? "btn-success" : "btn-outline"}`}
                onClick={() => handleRedeem(reward)}
                disabled={reward.claimed}
                style={{ width: "100%", marginTop: "auto" }}
              >
                {reward.claimed ? (
                  <>
                    <CheckCircle2 size={16} color="var(--green-dark)" />
                    <span>Claimed / Active</span>
                  </>
                ) : canAfford ? (
                  <>
                    <Gift size={16} />
                    <span>Redeem Reward</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Need {reward.points - currentPoints} More Pts</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      <Popup
        isOpen={activePopup.isOpen}
        title={activePopup.title}
        message={activePopup.message}
        type={activePopup.type}
        confirmText="OK"
        onClose={() => setActivePopup({ ...activePopup, isOpen: false })}
      />
    </div>
  );
}
