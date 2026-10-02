import React, { useState } from 'react';
import leagueData from '../data/leagueData.json';
import { GameButton } from '../components/GameButton';
import { Trophy, Flame, ArrowUp, Clock } from 'lucide-react';
import { sounds } from '../lib/sound';

interface LeagueProps {
  userXp: number;
  userStreak: number;
}

export const League: React.FC<LeagueProps> = ({ userXp, userStreak }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<typeof leagueData.leaderboard[0] | null>(null);

  // Sync user's real XP and streak into the leaderboard representation
  const leaderboard = leagueData.leaderboard.map((player) => {
    if (player.isUser) {
      return {
        ...player,
        xp: Math.max(player.xp, userXp),
        streak: userStreak,
      };
    }
    return player;
  }).sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, rank: idx + 1 }));

  const handleRowClick = (player: typeof leagueData.leaderboard[0]) => {
    sounds.playTap();
    setSelectedPlayer(player);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      {/* Championship League Trophy Header (Replaces top bar on League tab) */}
      <div className="relative game-card p-5 mb-4 bg-white border border-[#E4EEE9] text-center overflow-hidden shadow-sm">
        {/* Soft mint glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#DDF3EC] rounded-full blur-xl pointer-events-none" />

        {/* Golden Trophy in Mint Box */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center animate-bounce-slight mb-2 shadow-xs">
          <Trophy className="w-8 h-8 text-[#F2C14E] fill-[#F2C14E]" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-wider text-[#12746B] bg-[#DDF3EC] px-3.5 py-1 rounded-full border border-[#BEE3D7] inline-block mb-1">
          {leagueData.currentTier}
        </span>

        <h1 className="text-xl font-black text-[#1D2B33] mt-1">
          جدول رده‌بندی قهرمانان
        </h1>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[#6B7C85]">
          <Clock className="w-4 h-4 text-[#1F9A8A]" />
          <span>{leagueData.daysRemaining} روز و {leagueData.hoursRemaining} ساعت تا پایان هفته</span>
        </div>

        {/* Promotion banner rule */}
        <div className="mt-3.5 bg-[#DDF3EC]/50 border border-[#BEE3D7] rounded-2xl py-2 px-3 flex items-center justify-between text-xs font-black">
          <span className="flex items-center gap-1 text-[#3DAA6D]">
            <ArrowUp className="w-4 h-4 stroke-[3]" />
            ۳ نفر اول: صعود به لیگ الماس
          </span>
          <span className="text-[10px] text-[#6B7C85]">هفته دوازدهم</span>
        </div>
      </div>

      {/* Balanced layout spacing where character stood */}
      <div className="h-3" />

      {/* Leaderboard List */}
      <div className="space-y-2.5 my-3">
        {leaderboard.map((player) => {
          const isUser = player.isUser;

          return (
            <div
              key={player.name}
              onClick={() => handleRowClick(player)}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer touch-manipulation ${
                isUser
                  ? 'bg-[#DDF3EC] border-[#1F9A8A] shadow-sm'
                  : 'bg-white border-[#E4EEE9] hover:bg-[#DDF3EC]/20 shadow-xs'
              }`}
            >
              {/* Rank & Avatar & Name */}
              <div className="flex items-center gap-2.5">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-en font-black text-xs ${
                    player.rank === 1
                      ? 'bg-[#F2C14E] text-white shadow-xs'
                      : player.rank === 2
                      ? 'bg-[#1F9A8A] text-white shadow-xs'
                      : player.rank === 3
                      ? 'bg-[#DDF3EC] text-[#12746B] border border-[#BEE3D7]'
                      : 'bg-stone-100 text-[#6B7C85]'
                  }`}
                >
                  {player.rank}
                </div>

                {/* Avatar circle */}
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-xs"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {player.avatarLetter}
                </div>

                {/* Name & Streak */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#1D2B33]">
                      {player.name}
                    </span>
                    {isUser && (
                      <span className="text-[9px] bg-[#3DAA6D] text-white font-black px-1.5 py-0.5 rounded-md">
                        شما
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#6B7C85]">
                    <Flame className="w-3.5 h-3.5 fill-[#F2C14E] text-[#F2C14E]" />
                    <span className="font-en">{player.streak} days</span>
                  </div>
                </div>
              </div>

              {/* XP Score */}
              <div className="text-left">
                <span className="font-en text-sm font-black text-[#1D2B33] block tabular-nums">
                  {player.xp}
                </span>
                <span className="font-en text-[10px] font-bold text-[#1F9A8A] block">
                  XP
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected player modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2B33]/50 backdrop-blur-xs animate-pop-in">
          <div className="w-full max-w-sm bg-white border border-[#E4EEE9] rounded-3xl p-5 shadow-2xl text-center">
            <div
              className="mx-auto w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl text-white shadow-sm mb-3"
              style={{ backgroundColor: selectedPlayer.avatarColor }}
            >
              {selectedPlayer.avatarLetter}
            </div>

            <h3 className="text-base font-black text-[#1D2B33]">
              {selectedPlayer.name}
            </h3>
            <p className="text-xs font-medium text-[#6B7C85] mt-0.5">
              رتبه {selectedPlayer.rank} در لیگ طلا
            </p>

            <div className="grid grid-cols-2 gap-2.5 my-4 bg-[#DDF3EC]/40 p-3 rounded-2xl border border-[#BEE3D7]">
              <div>
                <span className="text-[10px] text-[#6B7C85] font-bold block">مجموع امتیاز</span>
                <span className="font-en text-lg font-black text-[#12746B]">{selectedPlayer.xp} XP</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7C85] font-bold block">زنجیره تمرین</span>
                <span className="font-en text-lg font-black text-[#3DAA6D]">{selectedPlayer.streak} روز</span>
              </div>
            </div>

            <GameButton
              variant="teal"
              size="md"
              fullWidth
              onClick={() => setSelectedPlayer(null)}
            >
              بستن
            </GameButton>
          </div>
        </div>
      )}
    </div>
  );
};
