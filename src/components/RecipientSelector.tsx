import React from 'react';
import { UserCheck, User, Building, Users, GraduationCap, Briefcase } from 'lucide-react';

interface RecipientSelectorProps {
  recipient: string;
  onChangeRecipient: (val: string) => void;
}

const COMMON_RECIPIENTS = [
  { label: 'Boss / Manager', icon: Briefcase },
  { label: 'Client / Customer', icon: Building },
  { label: 'Colleague / Peer', icon: Users },
  { label: 'Professor / Advisor', icon: GraduationCap },
  { label: 'Direct Report', icon: User },
  { label: 'Vendor / Support', icon: UserCheck },
];

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  recipient,
  onChangeRecipient,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="recipient-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
        >
          <span>Recipient</span>
          <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-slate-400">Who is receiving this?</span>
      </div>

      <div className="relative">
        <input
          id="recipient-input"
          type="text"
          value={recipient}
          onChange={(e) => onChangeRecipient(e.target.value)}
          placeholder="e.g. Boss / Manager, Client, Strict Landlord, Hiring Committee..."
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
      </div>

      {/* Quick Select Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Quick pick:</span>
        {COMMON_RECIPIENTS.map((item) => {
          const Icon = item.icon;
          const isSelected = recipient.toLowerCase() === item.label.toLowerCase();
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onChangeRecipient(item.label)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3 h-3 text-slate-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
